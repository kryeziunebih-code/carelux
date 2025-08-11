export default function ProviderCard({ provider }: { provider: any }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{provider.name}</h3>
          <p className="text-gray-600">{provider.specialty}</p>
        </div>
      </div>
    </div>
  );
}
