import { NextResponse } from 'next/server'

const TMDB_API_KEY = '7967738a03ec215c7d6d675faba9c973'
const BASE_URL = 'https://api.themoviedb.org/3'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '1'

    const response = await fetch(
      `${BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&page=${page}`,
      { next: { revalidate: 1800 } }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch now playing movies')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching now playing movies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch now playing movies' },
      { status: 500 }
    )
  }
}
