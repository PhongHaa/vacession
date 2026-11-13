# VACESSION — Shop thời trang

Website bán quần áo: **React + Vite + TypeScript** (frontend), **Node.js + Express + TypeScript** (backend), **PostgreSQL + Prisma** (database).

## Chạy lần đầu

Yêu cầu: Node.js 20+, Docker Desktop (đang mở).

```bash
npm run setup    # cài thư viện, bật PostgreSQL, tạo bảng, nạp dữ liệu mẫu
npm run dev      # chạy BE (:4000) + FE (:5173)
```

Mở http://localhost:5173

| Tài khoản admin | |
|---|---|
| Email | `admin@vacession.vn` |
| Mật khẩu | `Admin@123` — **đổi ngay** tại My Account → Thông tin tài khoản |

Trang quản trị: http://localhost:5173/admin

## Các lệnh hay dùng

| Lệnh | Tác dụng |
|---|---|
| `npm run dev` | Chạy cả FE + BE |
| `npm run db:up` / `db:down` | Bật / tắt PostgreSQL (Docker, cổng **5433**) |
| `npm run db:migrate` | Tạo migration sau khi sửa `backend/prisma/schema.prisma` |
| `npm run db:seed` | Nạp dữ liệu mẫu (không ghi đè dữ liệu đã có) |
| `npm run db:studio` | Mở giao diện xem/sửa database |
| `npm run db:mock-images` | Vẽ lại ảnh mẫu cho sản phẩm chưa có ảnh thật |
| `npm run build` | Build production |

## Chức năng

**Khách hàng**
- Trang chủ, New Arrivals, All, lọc theo danh mục, sắp xếp (mặc định / phổ biến / mới nhất / giá tăng / giá giảm), phân trang
- Trang sản phẩm: gallery (vuốt trên mobile), chọn size, báo hết hàng theo size, số lượng, mô tả / bảng size / thông tin giao hàng
- Giỏ hàng dạng drawer, lưu trong trình duyệt
- Thanh toán không cần tài khoản, COD hoặc chuyển khoản (hiện thông tin ngân hàng sau khi đặt)
- Tài khoản: đăng ký, đăng nhập (ghi nhớ), quên / đặt lại mật khẩu, lịch sử đơn, hủy đơn đang chờ, sửa thông tin & đổi mật khẩu
- Trang About, Contact (form lưu vào DB), Terms, Returns, Campaign (lookbook)

**Admin** (`/admin`)
- Tổng quan: doanh thu, số đơn, đơn chờ, khách hàng, tin nhắn chưa đọc
- Đơn hàng: lọc theo trạng thái, tìm kiếm, đổi trạng thái (hủy đơn tự hoàn kho)
- Sản phẩm: thêm / sửa / xóa, upload nhiều ảnh, sắp xếp ảnh, size & tồn kho, ảnh bảng size, ẩn/hiện, đánh dấu New
- Danh mục: thêm / sửa / xóa (danh mục tự hiện lên menu)
- Tin nhắn liên hệ

## Bản demo trên GitHub Pages

GitHub Pages chỉ chạy trang tĩnh, nên bản online là **bản demo**: frontend chạy một mình, mọi API được giả lập ngay trong
trình duyệt (`frontend/src/demo/server.ts`) và dữ liệu lưu trong localStorage của từng người xem. Đầy đủ chức năng mua
hàng, tài khoản và admin, nhưng đơn hàng không gửi về đâu cả. Tài khoản admin demo: `admin@vacession.vn` / `Admin@123`.

| Lệnh | Tác dụng |
|---|---|
| `npm run demo:export` | Xuất danh mục, sản phẩm, ảnh từ database ra `frontend/src/demo/seed.json` + `frontend/public/demo/` |
| `npm run build:demo` | Build bản demo vào `frontend/dist` |
| `npm run dev:demo -w frontend` | Chạy thử bản demo ở máy, không cần backend |

Mỗi lần push lên nhánh `main`, GitHub Actions (`.github/workflows/deploy-pages.yml`) tự build và đăng bản demo.
Muốn bản demo có dữ liệu mới: sửa trong Admin ở máy → `npm run demo:export` → commit và push.

**Gắn domain** `shop.memira.io.vn`: trong trang quản lý DNS, thêm bản ghi `CNAME` tên `shop` trỏ tới `phonghaa.github.io`.

## Cấu trúc

```
├── docker-compose.yml       # PostgreSQL
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma    # ⭐ cấu trúc database
│   │   ├── migrations/
│   │   └── seed.ts          # dữ liệu mẫu
│   ├── uploads/             # ảnh upload (không commit)
│   └── src/
│       ├── config/          # env, prisma client
│       ├── routes/          # URL → controller
│       ├── controllers/     # nhận request, trả response
│       ├── services/        # logic nghiệp vụ, truy vấn DB
│       ├── validators/      # kiểm tra dữ liệu (zod)
│       ├── middlewares/     # auth, upload, xử lý lỗi
│       └── utils/
└── frontend/
    ├── public/images/       # ảnh banner, lookbook (thay bằng ảnh thật)
    └── src/
        ├── pages/           # mỗi trang một thư mục (Admin/ tách bundle riêng)
        ├── components/      # common/, layout/, product/, account/
        ├── contexts/        # AuthContext, CartContext
        ├── services/        # gọi API
        ├── hooks/  utils/  types/  constants/
        └── styles/          # global.css chứa biến màu & font
```

Luồng backend: `route → validator → controller → service → Prisma → PostgreSQL`

## Tùy biến

- **Tên shop, thông tin ngân hàng, liên hệ, phí ship**: `backend/.env`
- **Màu sắc, font**: biến CSS đầu file `frontend/src/styles/global.css`
- **Tên thương hiệu**: `APP_NAME` trong `frontend/src/constants/index.ts`
- **Ảnh mẫu**: ảnh sản phẩm là SVG minh họa — thay bằng ảnh thật trong Admin. Banner/lookbook nằm ở `frontend/public/images/`
- **Nội dung About / Terms / Returns**: `frontend/src/pages/Static/`

## Trước khi đưa lên mạng

- Đổi `JWT_SECRET`, mật khẩu admin, mật khẩu PostgreSQL
- Gửi email thật: sửa `backend/src/utils/mailer.ts` (hiện chỉ in link đặt lại mật khẩu ra console)
- Nên thêm giới hạn số lần đăng nhập (vd. `express-rate-limit`)
- Ảnh upload đang lưu trên ổ đĩa server — khi deploy nhiều server nên chuyển sang S3 / Cloudinary
