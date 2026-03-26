import type { Config } from "tailwindcss";

const config: Config = {
  // 1. QUAN TRỌNG: Khai báo tất cả các đường dẫn chứa file code của bạn
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // Bao gồm cả thư mục src nếu bạn có dùng
    "./utils/**/*.{js,ts,jsx,tsx,mdx}", // Nếu bạn có viết UI logic trong utils
  ],

  theme: {
    extend: {
      // 2. Thêm các màu sắc chuyên cho Dashboard tài chính (tùy chọn)
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Bạn có thể thêm bảng màu tối riêng nếu muốn
        finance: {
          dark: "#020617",
          card: "#0f172a",
          border: "#1e293b",
          text: "#94a3b8",
          accent: "#eab308", // Màu vàng giống mẫu bạn đưa
        },
      },
      // 3. Đảm bảo font chữ số (monospace) hiển thị đẹp cho bảng tính
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
