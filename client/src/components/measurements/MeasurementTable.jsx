export default function MeasurementTable({ measurements }) {
  if (!measurements.length) return <div>Žádná měření.</div>;

  return (
    <table>
      <thead>
      <tr>
        <th>Čas</th>
        <th>Teplota</th>
        <th>Vlhkost půdy</th>
      </tr>
      </thead>
      <tbody>
      {measurements.map((m) => (
        <tr key={m._id}>
          <td>{new Date(m.createdAt).toLocaleString('cs-CZ')}</td>
          <td>{m.temperature}°C</td>
          <td>{m.humidity}%</td>
        </tr>
      ))}
      </tbody>
    </table>
  );
}