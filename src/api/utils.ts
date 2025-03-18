import { Video, Category } from "./vidchain-api";

export function fromMotokoVideo(motokoVideo: any): Video {
    return {
      id: BigInt(motokoVideo.id),
      title: motokoVideo.title,
      description: motokoVideo.description,
      category: motokoVideo.category,
      channel: motokoVideo.channel,
      uploader: motokoVideo.uploader,
      timestamp: BigInt(motokoVideo.timestamp),
      duration: Number(motokoVideo.duration),
      media: motokoVideo.media,
      views: Number(motokoVideo.views),
      likes: Number(motokoVideo.likes),
      dislikes: Number(motokoVideo.dislikes),
      tokenRewards: BigInt(motokoVideo.tokenRewards),
      isDeleted: motokoVideo.isDeleted,
    };
  }
  
  
  export function toMotokoCategory(category: string): Category {
    switch (category) {
      case "LongForm":
        return { LongForm: null };
      case "Short":
        return { Short: null };
      case "Entertainment":
        return { Entertainment: null };
      case "Education":
        return { Education: null };
      case "Gaming":
        return { Gaming: null };
      case "Music":
        return { Music: null };
      case "Technology":
        return { Technology: null };
      default:
        return { Other: null };
    }
  }
  