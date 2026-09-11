export default function CreateVehicleLot() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Create Vehicle Lot</h1>

      <div className="mt-6 space-y-4">
        <input
          className="w-full rounded border p-3"
          placeholder="Vehicle Title"
        />

        <input
          className="w-full rounded border p-3"
          placeholder="Price"
        />

        <button className="rounded bg-blue-600 px-6 py-3 text-white">
          Create Lot
        </button>
      </div>
    </div>
  );
}
