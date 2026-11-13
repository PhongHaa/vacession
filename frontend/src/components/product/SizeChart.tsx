/** Bảng size mặc định khi sản phẩm chưa có ảnh size chart riêng */
const ROWS = [
  { size: 'S', height: '160 - 168', weight: '50 - 58', chest: '106', length: '68' },
  { size: 'M', height: '168 - 174', weight: '58 - 66', chest: '110', length: '70' },
  { size: 'L', height: '174 - 180', weight: '66 - 75', chest: '114', length: '72' },
  { size: 'XL', height: '180 - 186', weight: '75 - 85', chest: '118', length: '74' },
];

export default function SizeChart({ image }: { image?: string | null }) {
  if (image) return <img src={image} alt="Bảng size" className="size-chart-img" loading="lazy" />;
  return (
    <div className="table-scroll">
      <table className="table size-table">
        <thead>
          <tr><th>Size</th><th>Chiều cao (cm)</th><th>Cân nặng (kg)</th><th>Ngực (cm)</th><th>Dài áo (cm)</th></tr>
        </thead>
        <tbody>
          {ROWS.map((r) => (
            <tr key={r.size}><td>{r.size}</td><td>{r.height}</td><td>{r.weight}</td><td>{r.chest}</td><td>{r.length}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
