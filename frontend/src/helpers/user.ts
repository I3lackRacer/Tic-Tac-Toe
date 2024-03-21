import Cookies from "js-cookie"

export interface User {
  id: number
  username: string
  mmr: number
  isAdmin: boolean
  wins: number
  losses: number
  profilePicture?: string | null
}

export interface UserInfo {
  id: number
  username: string
  mmr: number
  isAdmin: boolean
}

export interface GameInfo {
  gameId: number
  player1: UserInfo,
  player2: UserInfo
}


export async function fetchUser (): Promise<User | null> {
  try {
    const jwtToken = Cookies.get('jwtToken') // Assuming you're using js-cookie or a similar library

    // Check if the token exists
    if (!jwtToken) {
      throw new Error('Authentication token not found. Please login first.')
    }

    // Make a GET request to the user endpoint
    const response = await fetch('/api/v1/user', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwtToken}`, // Use the JWT token for authorization
        'Content-Type': 'application/json',
      },
    })
    // Check if the response was successful
    if (!response.ok) {
      throw new Error('Failed to fetch user data. Please check your authentication token.')
    }
    const userData = await response.json()

    let file = await fetchImage(userData.id)
    console.log(file)


    return {
      id: userData.id,
      username: userData.username,
      mmr: Math.floor(userData.mmr),
      isAdmin: userData.isAdmin,
      wins: 10,
      losses: 5,
      profilePicture: file?.size !== 0 ? URL.createObjectURL(file!) : null
    }

  } catch (error: any) {
    console.error('Error:', error.message)
    return null
  }
}

export async function fetchAllUsers (): Promise<User[] | null> {
  try {
    const jwtToken = Cookies.get('jwtToken')
    if (!jwtToken) {
      throw new Error('Authentication token not found. Please login first.')
    }
    const response = await fetch('/api/v1/user/all', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json',
      },
    })
    if (!response.ok) {
      throw new Error('Failed to fetch user data. Please check your authentication token.')
    }
    return await response.json()
  } catch (error: any) {
    console.error('Error:', error.message)
    return null
  }
}

export async function putImage (file: File, id: number): Promise<void> {
  try {
    const jwtToken = Cookies.get('jwtToken') // Assuming you're using js-cookie or a similar library

    // Check if the token exists
    if (!jwtToken) {
      throw new Error('Authentication token not found. Please login first.')
    }

    const formData = new FormData()
    formData.append('image', file)

    const response = await fetch(`/api/v1/user/${id}/upload-image`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${jwtToken}`, // Use the JWT token for authorization
      },
      body: formData, // Pass FormData as the request body
    })

    if (!response.ok) {
      throw new Error('Failed to fetch user data. Please check your authentication token.')
    }

    // Handle response here, for example, log success message or parse JSON response if needed
    console.log('Image uploaded successfully.')

  } catch (error: any) {
    console.error('Error:', error.message)
    return
  }
}

export async function fetchImage (id: number): Promise<File | null> {
  try {
    const jwtToken = Cookies.get('jwtToken') // Assuming you're using js-cookie or a similar library

    if (!jwtToken) {
      throw new Error('Authentication token not found. Please login first.')
    }

    // Make a GET request to the user endpoint
    const response = await fetch(`/api/v1/user/${id}/image`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${jwtToken}`, // Use the JWT token for authorization
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch image. Please check your authentication token.')
    }

    const blob = await response.blob() // Get the image data as a Blob

    // Create a filename. You might want to derive this from the response or use a placeholder
    const filename = 'downloaded-image.jpg' // Placeholder filename, adjust as needed

    // Create a File object from the Blob
    const file = new File([blob], filename, { type: blob.type })

    return file

  } catch (error: any) {
    console.error('Error:', error.message)
    return null
  }
}
