import { NextResponse } from 'next/server'

const TMDB_API_KEY = '7967738a03ec215c7d6d675faba9c973'
const BASE_URL = 'https://api.themoviedb.org/3'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: movieId } = await params

    const [movieResponse, creditsResponse, videosResponse, similarResponse] = await Promise.all([
      fetch(`${BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=external_ids`, {
        next: { revalidate: 3600 }
      }),
      fetch(`${BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`, {
        next: { revalidate: 3600 }
      }),
      fetch(`${BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_API_KEY}`, {
        next: { revalidate: 3600 }
      }),
      fetch(`${BASE_URL}/movie/${movieId}/similar?api_key=${TMDB_API_KEY}`, {
        next: { revalidate: 3600 }
      })
    ])

    if (!movieResponse.ok) {
      throw new Error('Failed to fetch movie details')
    }

    const movieData = await movieResponse.json()

    // Fetch collection details if movie belongs to a collection
    let collectionData = null
    if (movieData.belongs_to_collection) {
      const collectionResponse = await fetch(
        `${BASE_URL}/collection/${movieData.belongs_to_collection.id}?api_key=${TMDB_API_KEY}`,
        { next: { revalidate: 3600 } }
      )
      if (collectionResponse.ok) {
        collectionData = await collectionResponse.json()
      }
    }

    const [credits, videos, similar] = await Promise.all([
      creditsResponse.json(),
      videosResponse.json(),
      similarResponse.json()
    ])

    return NextResponse.json({
      movie: movieData,
      collection: collectionData,
      credits,
      videos,
      similar
    })
  } catch (error) {
    console.error('Error fetching movie details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch movie details', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
