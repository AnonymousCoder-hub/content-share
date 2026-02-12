import { NextResponse } from 'next/server'

const TMDB_API_KEY = '7967738a03ec215c7d6d675faba9c973'
const BASE_URL = 'https://api.themoviedb.org/3'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    const page = searchParams.get('page') || '1'
    const region = searchParams.get('region') || 'US'

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }

    const response = await fetch(
      `${BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}&region=${region}`,
      { next: { revalidate: 1800 } }
    )

    if (!response.ok) {
      throw new Error('Failed to search')
    }

    const data = await response.json()
    
    // Sort results by popularity (most popular first)
    if (data.results) {
      data.results = data.results.sort((a: any, b: any) => (b.popularity || 0) - (a.popularity || 0))
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error searching:', error)
    return NextResponse.json(
      { error: 'Failed to search' },
      { status: 500 }
    )
  }
}
