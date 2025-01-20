const Table = ({ data }) => {
  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-start text-xs font-medium uppercase text-gray-500"
            >
              Key
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-start text-xs font-medium uppercase text-gray-500"
            >
              Value
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200">
          {data.map((item, index) => (
            <tr key={index}>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-800">{item.key}</td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-800">{item.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Table
