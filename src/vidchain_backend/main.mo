import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Float "mo:base/Float";
import Hash "mo:base/Hash";
import Int "mo:base/Int";
import List "mo:base/List";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Iter "mo:base/Iter";
import HashMap "mo:base/HashMap";
import Order "mo:base/Order";

// ========== TYPE DEFINITIONS ==========
actor VidChain {
  public type VideoId = Nat;
  public type TokenAmount = Nat;
  public type Category = {
    #LongForm;
    #Short;
    #Entertainment;
    #Education;
    #Gaming;
    #Music;
    #Technology;
    #Other;
  };

  
  public type Playlist = {
    id : Nat;
    name : Text;
    videoIds : [VideoId];
  };

  type Media = {
    content : Blob;
    thumbnail : Blob;
    isShort : Bool;
    contentType : Text;
  };

  public type Video = {
    id : VideoId;
    title : Text;
    description : Text;

    category : Category;
    channel : Text;
    uploader : Principal;
    timestamp : Int;
    duration : Nat;
    thumbnail : Blob;
    contentHash : Blob;
    views : Nat;
    likes : Nat;
    dislikes : Nat;
    comments : List.List<Comment>;
    reports : List.List<Report>;
    tokenRewards : Nat;
    nftMetadata : ?NFTMetadata;
    isDeleted : Bool;
    media : Media;
  };

  public type Comment = {
    id : Nat;
    author : Principal;
    content : Text;
    timestamp : Int;
    likes : Nat;
    replies : List.List<Comment>;
  };

  public type Report = {
    reason : Text;
    reporter : Principal;
    timestamp : Int;
  };

  public type NFTMetadata = {
    tokenId : Text;
    contractAddress : Text;
    owner : Principal;
    mintDate : Int;
  };


  public type UserProfile = {
    principal : Principal;
    name : Text;
    email : ?Text;
    gender : ?Text;
    birthday : ?Int;
    totalWatchTime : Nat;
    playlists : [(Text, Playlist)];
    channelName : Text;
    totalViews : Nat;
    totalVideos : Nat;
    subscriberCount : Nat;
    tokenBalance : Nat;
    stakedTokens : TokenAmount;
  };

  // ========== STABLE STORAGE ==========
  stable var userProfilesEntries : [(Principal, UserProfile)] = [];
  stable var videos : List.List<Video> = List.nil();
  stable var videoIdCounter : VideoId = 0;
  stable var tokenLedgerEntries : [(Principal, TokenAmount)] = [];
  stable var trendingVideos : [VideoId] = [];

  // ========== STATE INITIALIZATION ==========
  private var userProfiles = HashMap.fromIter<Principal, UserProfile>(
    userProfilesEntries.vals(),
    0,
    Principal.equal,
    Principal.hash,
  );
  private var tokenLedger = HashMap.fromIter<Principal, TokenAmount>(
    tokenLedgerEntries.vals(),
    0,
    Principal.equal,
    Principal.hash,
  );
  private let viewHistory = HashMap.HashMap<Principal, HashMap.HashMap<VideoId, Int>>(
    0,
    Principal.equal,
    Principal.hash,
  );

  private func all<T>(array : [T], predicate : T -> Bool) : Bool {
    for (element in array.vals()) {
      if (not predicate(element)) return false;
    };
    true;
  };

  // ========== ERROR HANDLING ==========
  public type Error = {
    #Unauthorized;
    #VideoNotFound;
    #InsufficientTokens;
    #InvalidContent;
    #DuplicateAction;
    #ReportLimitExceeded;
    #InvalidCategory;
    #InvalidDuration;
  };

  // ========== USER PROFILE MANAGEMENT ==========
  public shared ({ caller }) func updateProfile(
    profile : {
      name : Text;
      email : ?Text;
      gender : ?Text;
      birthday : ?Int;
    }
  ) : async () {
    let user = switch (userProfiles.get(caller)) {
      case null {
        {
          principal = caller;
          name = profile.name;
          email = profile.email;
          gender = profile.gender;
          birthday = profile.birthday;
          totalWatchTime = 0;
          playlists = []; 
          channelName = "";
          totalViews = 0;
          totalVideos = 0;
          subscriberCount = 0;
          tokenBalance = 0;
          stakedTokens = 0;
        };
      };
      case (?existing) {
        {
          existing with
          name = profile.name;
          email = profile.email;
          gender = profile.gender;
          birthday = profile.birthday;
        };
      };
    };
    userProfiles.put(caller, user);
  };

  // ========== VIDEO MANAGEMENT ==========
  public shared ({ caller }) func uploadVideo(
    title : Text,
    description : Text,
    category : Category,
    channel : Text,
    media : Blob,
    isShort : Bool,
    contentType : Text,
    duration : Nat,
    thumbnail : Blob,
    contentHash : Blob,
  ) : async Result.Result<VideoId, Error> {
    if (Text.size(title) < 5 or Text.size(description) < 10) {
      return #err(#InvalidContent);
    };
    if (duration == 0) {
      return #err(#InvalidDuration);
    };

    let newVideo : Video = {
      id = videoIdCounter;
      title;
      description;
      category;
      channel;
      uploader = caller;
      timestamp = Time.now();
      duration;
      thumbnail;
      contentHash;
      views = 0;
      likes = 0;
      dislikes = 0;
      comments = List.nil();
      reports = List.nil();
      tokenRewards = 0;
      nftMetadata = null;
      isDeleted = false;
      media = {
        content = media;
        thumbnail;
        isShort;
        contentType;
      };
    };

    videos := List.push(newVideo, videos);
    videoIdCounter += 1;

    updateUserProfile(caller, func(profile) { { profile with
    totalVideos = profile.totalVideos + 1; channelName = if (profile.channelName == "") channel else profile.channelName } });

    #ok(newVideo.id);
  };

  public shared ({ caller }) func deleteVideo(videoId : VideoId) : async Result.Result<(), Error> {
    switch (findVideo(videoId)) {
      case null #err(#VideoNotFound);
      case (?video) {
        if (video.uploader != caller) {
          #err(#Unauthorized);
        } else {
          videos := List.map<Video, Video>(
            videos,
            func(v : Video) : Video {
              if (v.id == videoId) { { v with isDeleted = true } } else {
                v;
              };
            },
          );
          #ok(());
        };
      };
    };
  };

  // ========== CONTENT MODERATION ==========
  public shared ({ caller }) func reportVideo(videoId : VideoId, reason : Text) : async Result.Result<(), Error> {
    let report : Report = {
      reason;
      reporter = caller;
      timestamp = Time.now();
    };

    videos := List.map<Video, Video>(
      videos,
      func(v : Video) : Video {
        if (v.id == videoId) {
          { v with reports = List.push<Report>(report, v.reports) };
        } else {
          v;
        };
      },
    );

    switch (findVideo(videoId)) {
      case null {};
      case (?video) {
        if (List.size<Report>(video.reports) >= 5) {
          await autoModerateContent(videoId);
        };
      };
    };

    #ok(());
  };

  // ========== ANALYTICS ==========
  public query func getChannelAnalytics(principal : Principal) : async {
    totalViews : Nat;
    totalVideos : Nat;
    avgWatchTime : Float;
    popularContent : [Video];
  } {
    let userVideos = Array.filter<Video>(
      List.toArray(videos),
      func(v : Video) : Bool {
        v.uploader == principal;
      },
    );
    let totalViews = Array.foldLeft<Video, Nat>(
      userVideos,
      0,
      func(acc : Nat, v : Video) : Nat {
        acc + v.views;
      },
    );
    let totalWatchTime = Array.foldLeft<Video, Nat>(
      userVideos,
      0,
      func(acc : Nat, v : Video) : Nat {
        acc + (v.views * v.duration);
      },
    );
    {
      totalViews;
      totalVideos = Array.size(userVideos);
      avgWatchTime = if (totalViews > 0) {
        Float.fromInt(totalWatchTime) / Float.fromInt(totalViews);
      } else {
        0.0;
      };
      popularContent = Array.sort<Video>(
        userVideos,
        func(a : Video, b : Video) : Order.Order {
          Nat.compare(b.views, a.views);
        },
      );
    };
  };


  public shared query func getBalance() : async Result.Result<Nat, Error> {
    return #ok(1000); // TODO:  fetch user balance
  };

  public shared query func getTrendingVideos() : async Result.Result<[Video], Error> {
    //TODO: Implement logic to fetch trending videos
    #ok([]);
  };

  public shared ({ caller }) func getProfile() : async Result.Result<{ name : Text; email : ?Text; channelName : Text; totalViews : Nat; tokenBalance : Nat }, Error> {
    switch (userProfiles.get(caller)) {
      case null #err(#Unauthorized);
      case (?profile) #ok({
        name = profile.name;
        email = profile.email;
        channelName = profile.channelName;
        totalViews = profile.totalViews;
        tokenBalance = profile.tokenBalance;
      });
    };
  };

  // ========== TOKEN ECONOMY ==========
  public shared ({ caller }) func stakeTokens(amount : TokenAmount) : async Result.Result<(), Error> {
    let balance = getTokenBalance(caller);
    if (balance < amount) {
      return #err(#InsufficientTokens);
    };
    tokenLedger.put(caller, balance - amount);
    updateUserProfile(caller, func(profile) { { profile with stakedTokens = profile.stakedTokens + amount } });
    #ok(());
  };

  // ========== NFT INTEGRATION ==========
  public shared ({ caller }) func mintVideoNFT(videoId : VideoId, contractAddress : Text) : async Result.Result<(), Error> {
    switch (findVideo(videoId)) {
      case null #err(#VideoNotFound);
      case (?video) {
        if (video.uploader != caller) {
          #err(#Unauthorized);
        } else if (video.isDeleted) {
          #err(#VideoNotFound);
        } else {
          let nftData : NFTMetadata = {
            tokenId = generateNFTId(videoId, caller);
            contractAddress;
            owner = caller;
            mintDate = Time.now();
          };
          videos := List.map<Video, Video>(
            videos,
            func(v : Video) : Video {
              if (v.id == videoId) { { v with nftMetadata = ?nftData } } else {
                v;
              };
            },
          );
          #ok(());
        };
      };
    };
  };

  // ========== SEARCH & DISCOVERY ==========
  public query func searchVideos(searchText : Text, categoryFilter : ?Category) : async [Video] {
    let searchTerms = Text.split(searchText, #text " ");
    List.toArray(
      List.filter<Video>(
        videos,
        func(v : Video) : Bool {
          let matchesCategory = switch (categoryFilter) {
            case null true;
            case (?c) v.category == c;
          };
          let containsTerm = func(term : Text) : Bool {
            Text.contains(v.title, #text term) or Text.contains(v.description, #text term);
          };
          not v.isDeleted and matchesCategory and all(Iter.toArray(searchTerms), containsTerm);
        },
      )
    );
  };

  // ========== VIEW TRACKING ==========
  public shared ({ caller }) func watchVideo(videoId : VideoId) : async Result.Result<(), Error> {
    if (hasRecentView(caller, videoId)) {
      return #err(#DuplicateAction);
    };
    switch (findVideo(videoId)) {
      case null #err(#VideoNotFound);
      case (?video) {
        let reward = calculateViewReward(video);
        distributeViewRewards(video.uploader, reward);
        videos := List.map<Video, Video>(
          videos,
          func(v : Video) : Video {
            if (v.id == videoId) { { v with views = v.views + 1 } } else {
              v;
            };
          },
        );
        updateViewHistory(caller, videoId);
        #ok(());
      };
    };
  };

  // ========== VIDEO QUERY METHODS ==========
public query func getAllVideos() : async [Video] {
  List.toArray(
    List.filter<Video>(videos, func(v : Video) : Bool { not v.isDeleted })
  );
};

public query func getVideoById(videoId : VideoId) : async ?Video {
  findVideo(videoId);
};

public shared ({ caller }) func likeVideo(videoId : VideoId) : async Result.Result<(), Error> {
  switch (findVideo(videoId)) {
    case null { #err(#VideoNotFound) };
    case (?video) {
      videos := List.map<Video, Video>(
        videos,
        func(v : Video) : Video {
          if (v.id == videoId) {
            { v with likes = v.likes + 1 }  
          } else {
            v
          }
        }
      );
      #ok(());
    }
  }
};

public shared ({ caller }) func dislikeVideo(videoId : VideoId) : async Result.Result<(), Error> {
  switch (findVideo(videoId)) {
    case null { #err(#VideoNotFound) };
    case (?video) {
      videos := List.map<Video, Video>(
        videos,
        func(v : Video) : Video {
          if (v.id == videoId) {
            { v with dislikes = v.dislikes + 1 }  
          } else {
            v
          }
        }
      );
      #ok(());
    }
  }
};

// ========== COMMENT SYSTEM ==========
public query func getComments(videoId : VideoId) : async [Comment] {
  switch (findVideo(videoId)) {
    case null { [] };
    case (?video) { List.toArray(video.comments) };
  };
};

// ========== USER-SPECIFIC QUERIES ==========
public query func getUserVideos(user : Principal) : async [Video] {
  List.toArray(
    List.filter<Video>(
      videos,
      func(v : Video) : Bool {
        v.uploader == user and not v.isDeleted
      }
    )
  );
};

public query func getUserProfile(principal : Principal) : async ?UserProfile {
  userProfiles.get(principal);
};

public query func getPlaylists(user : Principal) : async [Playlist] {
  switch (userProfiles.get(user)) {
    case null { [] };
    case (?profile) { 
      Array.map<(Text, Playlist), Playlist>(
        profile.playlists,
        func((_, p) : (Text, Playlist)) : Playlist { p }
      )
    };
  };
};

// ========== CATEGORY BROWSING ==========
public query func getVideosByCategory(category : Category) : async [Video] {
  List.toArray(
    List.filter<Video>(
      videos,
      func(v : Video) : Bool {
        not v.isDeleted and v.category == category
      }
    )
  );
};

  // ========== HELPER FUNCTIONS ==========
  private func findVideo(videoId : VideoId) : ?Video {
    List.find<Video>(
      videos,
      func(v : Video) : Bool {
        v.id == videoId and not v.isDeleted
      },
    );
  };

  private func updateUserProfile(user : Principal, update : UserProfile -> UserProfile) {
    let current = switch (userProfiles.get(user)) {
      case null {
        {
          principal = user;
          name = "";
          email = null;
          gender = null;
          birthday = null;
          totalWatchTime = 0;
          playlists = [];
          channelName = "";
          totalViews = 0;
          totalVideos = 0;
          subscriberCount = 0;
          tokenBalance = 0;
          stakedTokens = 0;
        };
      };
      case (?profile) profile;
    };
    userProfiles.put(user, update(current));
  };

  private func getTokenBalance(user : Principal) : TokenAmount {
    switch (tokenLedger.get(user)) {
      case null 0;
      case (?amount) amount;
    };
  };

  // ========== STABILITY HOOKS ==========
  system func preupgrade() : () {
    userProfilesEntries := Iter.toArray(userProfiles.entries());
    tokenLedgerEntries := Iter.toArray(tokenLedger.entries());
  };

  system func postupgrade() : () {
    userProfiles := HashMap.fromIter<Principal, UserProfile>(
      userProfilesEntries.vals(),
      0,
      Principal.equal,
      Principal.hash,
    );
    tokenLedger := HashMap.fromIter<Principal, TokenAmount>(
      tokenLedgerEntries.vals(),
      0,
      Principal.equal,
      Principal.hash,
    );
    userProfilesEntries := [];
    tokenLedgerEntries := [];
  };

  private func generateNFTId(videoId : VideoId, user : Principal) : Text {
    let principalStr = Principal.toText(user);
    let videoStr = Nat.toText(videoId);
    let timeStr = Int.toText(Time.now());
    principalStr # "_" # videoStr # "_" # timeStr;
  };

  private func autoModerateContent(videoId : VideoId) : async () {
    // TODO: Look into tensorflow based moderation
  };

  private func calculateViewReward(video : Video) : TokenAmount {
    var reward : TokenAmount = 0;
    if (video.views < 100) {
      reward := 1;
    } else if (video.views < 1000) {
      reward := 2;
    } else if (video.views < 10000) {
      reward := 5;
    } else {
      reward := 10;
    };
    reward;
  };

  private func hasRecentView(caller : Principal, videoId : VideoId) : Bool {
    switch (viewHistory.get(caller)) {
      case null false;
      case (?userViews) {
        switch (userViews.get(videoId)) {
          case null false;
          case (?timestamp) {
            Time.now() - timestamp < 300_000_000_000;
          };
        };
      };
    };
  };

  private func updateViewHistory(caller : Principal, videoId : VideoId) {
    let currentTime = Time.now();
    let userViews = switch (viewHistory.get(caller)) {
      case null HashMap.HashMap<VideoId, Int>(0, Nat.equal, Hash.hash);
      case (?existing) existing;
    };
    userViews.put(videoId, currentTime);
    viewHistory.put(caller, userViews);
  };

  private func distributeViewRewards(uploader : Principal, amount : TokenAmount) {
    let current = getTokenBalance(uploader);
    tokenLedger.put(uploader, current + amount);
  };
};
