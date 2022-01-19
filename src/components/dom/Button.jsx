export function Button({ primary = false, ...props }) {
  const colors = primary
    ? 'border-0 text-white bg-hubs-blue hover:bh-hubs-lightblue'
    : 'border-2 border-hubs-blue text-hubs-blue hover:text-hubs-lightblue'
  return <button className={`${colors} font-semibold px-5 py-2 rounded-lg`} {...props} />
}
