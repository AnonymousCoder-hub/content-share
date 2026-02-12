import { NextResponse } from 'next/server'

const TMDB_API_KEY = '7967738a03ec215c7d6d675faba9c973'
const BASE_URL = 'https://api.themoviedb.org/3'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const timeWindow = searchParams.get('timeWindow') || 'week'

    const response = await fetch(
      `${BASE_URL}/trending/tv/${timeWindow}?api_key=${TMDB_API_KEY}`,
      { next: { revalidate: 3600 } }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch trending TV shows')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching trending TV shows:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trending TV shows' },
      { status: 500 }
    )
  }
}
