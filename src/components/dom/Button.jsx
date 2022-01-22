export function Button({ primary = false, className, ...props }) {
  const colors = primary
    ? 'border-0 text-white bg-hubs-blue hover:bh-hubs-lightblue'
    : 'border-2 border-hubs-blue text-hubs-blue hover:text-hubs-lightblue'
  return (
    <button className={`${className} ${colors} font-semibold px-5 py-2 rounded-lg flex items-center justify-center gap-2`} {...props} />
  )
}
