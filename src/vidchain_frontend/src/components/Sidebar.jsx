import React from "react";
import { Stack } from "@mui/material";
import { categories } from "../utils/constants";

const Categories = ({ selectedCategory, setSelectedCategory }) => (
  <Stack
    direction="row"
    sx={{
      overflow: "hidden",  // Hide scrollbar
      height: { sx: "auto", md: "95%" },
      flexDirection: { md: "column" },
      whiteSpace: "nowrap", // Prevent wrapping
    }}
  >
    {categories?.length > 0 &&
      categories.map((category) => (
        <button
          type="button"
          className="category-btn"
          onClick={() => setSelectedCategory(category.name)}
          style={{
            backgroundColor: category.name === selectedCategory ? "#011936" : "transparent",
            color: "white",
            padding: "10px",
            display: "flex",
            alignItems: "center",
            width: "100%",
            border: "none",
            cursor: "pointer",
            transition: "all 0.3s ease",
            borderRadius: category.name === selectedCategory ? "20px" : "0", // Rounded when selected
          }}
          key={category.name}
        >
          <span style={{ color: category.name === selectedCategory ? "white" : "blue", marginRight: "15px" }}>
            {category.icon}
          </span>
          <span style={{ opacity: category.name === selectedCategory ? "1" : "0.8" }}>
            {category.name}
          </span>
        </button>
      ))}
  </Stack>
);

export default Categories;
