/**
 * Debugging utility for stateful timeouts
 * @param {number} ms
 * @return {[boolean, () => void]}
 */
function useFuse(ms) {
  const [active, setActive] = useState(false)
  const timeout = useRef()
  const trigger = () => {
    clearTimeout(timeout.current)
    setActive(true)
    timeout.current = setTimeout(() => setActive(false), ms)
  }
  useEffect(() => {
    return () => clearTimeout(timeout.current)
  }, [timeout])
  return [active, trigger]
}
