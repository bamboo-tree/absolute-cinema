import './style.css'

const NotFound = () => {
  return (
    <div className='not-found'>
      <h1 className='not-found-title'>Page Not Found</h1>
      <p className='not-found-info'>Sorry, the page you are looking for does not exist.</p>
      <a href="/home" className='not-found-link'>Go to Home</a>
    </div>
  )
}
export default NotFound