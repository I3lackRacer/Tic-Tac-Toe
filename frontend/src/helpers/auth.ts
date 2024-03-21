import { ref } from 'vue'
import Cookies from 'js-cookie'

export default function useAuth () {
  const isLoggedIn = ref(Cookies.get('jwtToken') !== undefined)

  const checkAuth = () => {
    isLoggedIn.value = Cookies.get('jwtToken') !== undefined
  }

  return { isLoggedIn, checkAuth }
}