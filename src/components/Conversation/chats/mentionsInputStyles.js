export default {
  control: {
    color: "#2f2d52",
    fontSize:
      typeof window !== "undefined" && window.innerWidth > 1500 ? 16 : 14,
    // fontWeight: 'normal',
  },
  "&multiLine": {
    control: {
      minHeight: 63,
      width: "100%",
    },
    highlighter: {
      padding: 9,
      border: "1px solid transparent",
      boxSizing: "border-box",
    },
    input: {
      margin: 0,
      padding: 9,
      border: "1px solid silver",
      boxSizing: "border-box",
      width: "100%",
    },
  },
  "&singleLine": {
    display: "flex",
    width: "100%",
    whiteSpace: "nowrap",

    highlighter: {
      boxSizing: "border-box",
    },

    input: {
      border: "none",
      outline: "none",
      boxShadow: "none",
      width: "100%",
      background: "transparent", // optional cleaner look
    },
  },
  suggestions: {
    width: "100%",
    overflow: "hidden",
    list: {
      position: "absolute", 
      zIndex: 999,
      width: "100%",
      backgroundColor: "rgba(253, 255, 237, 0.958)",
      border: "none",
      fontSize:
        typeof window !== "undefined" && window.innerWidth > 1500 ? 16 : 14,
    },
  },
};
