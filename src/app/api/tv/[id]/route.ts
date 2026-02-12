import { NextResponse } from 'next/server'

const TMDB_API_KEY = '7967738a03ec215c7d6d675faba9c973'
const BASE_URL = 'https://api.themoviedb.org/3'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tvId } = await params
    const { searchParams } = new URL(request.url)
    const season = searchParams.get('season')

    // If season parameter is provided, return episodes for that season
    if (season) {
      const seasonResponse = await fetch(
        `${BASE_URL}/tv/${tvId}/season/${season}?api_key=${TMDB_API_KEY}`,
        { next: { revalidate: 3600 } }
      )

      if (!seasonResponse.ok) {
        throw new Error('Failed to fetch season episodes')
      }

      const seasonData = await seasonResponse.json()

      return NextResponse.json({
        episodes: seasonData.episodes || []
      })
    }

    // Otherwise, return full TV show details
    const [tvResponse, creditsResponse, videosResponse, similarResponse] = await Promise.all([
      fetch(`${BASE_URL}/tv/${tvId}?api_key=${TMDB_API_KEY}&append_to_response=external_ids`, {
        next: { revalidate: 3600 }
      }),
      fetch(`${BASE_URL}/tv/${tvId}/credits?api_key=${TMDB_API_KEY}`, {
        next: { revalidate: 3600 }
      }),
      fetch(`${BASE_URL}/tv/${tvId}/videos?api_key=${TMDB_API_KEY}`, {
        next: { revalidate: 3600 }
      }),
      fetch(`${BASE_URL}/tv/${tvId}/similar?api_key=${TMDB_API_KEY}`, {
        next: { revalidate: 3600 }
      })
    ])

    if (!tvResponse.ok) {
      throw new Error('Failed to fetch TV show details')
    }

    const [tv, credits, videos, similar] = await Promise.all([
      tvResponse.json(),
      creditsResponse.json(),
      videosResponse.json(),
      similarResponse.json()
    ])

    return NextResponse.json({
      tv,
      credits,
      videos,
      similar
    })
  } catch (error) {
    console.error('Error fetching TV show details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch TV show details', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
