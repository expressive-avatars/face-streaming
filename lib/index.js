import './facetracking-widget'
import './facetracking-canditate'

// load lib stylesheet
const link = document.createElement('link')
link.rel = 'stylesheet'
link.type = 'text/css'
link.href = import.meta.env.VITE_LIB + '/style.css'
document.head.appendChild(link)
