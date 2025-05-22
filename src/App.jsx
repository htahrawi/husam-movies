import React, { useEffect, useState } from 'react'
import Search from './components/Search'
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';
import { useDebounce } from 'react-use';
import { getTrendingMovies, updateSearchCount } from '../appwrite';

const API_BASE_URL = 'https://api.themoviedb.org/3'
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}


const App = ()=>{
  const [debounceSearchTerm, setDebounceSearchTerm ] = useState('')
  const [searchTerm, setSearchTerm] = useState('');
  
  const [movieList, setMovieList] = useState([]);
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState()
  
  const [trendingMovies, setTrendingMovies] = useState([]);


  useDebounce(()=> setDebounceSearchTerm(searchTerm), 1500, [searchTerm])

  const fetchMovies = async (query)=>{
    setIsLoading(true)
    setErrorMessage('')
    try {
      const endpoint = query ?  
        `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`        
        :
        `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`
      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) {
        throw new Error('Faild to fetch movies')
      }
      const data = await response.json();
      if (data.response === 'false') {
        setErrorMessage(data.Error || 'Faild to fetch movies')
        setMovieList([])
        return;
      }
      setMovieList(data.results || [])
      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0])
        console.log("HeRE: ",data.results[0]);
        console.log("Qureie : ",query);
      }
    } catch (error) {
      console.log(`Error Fetching Movies: ${error}`);
      setErrorMessage(`Error Fetching Movies: ${error}`)
    }finally{
      setIsLoading(false)
    }
  }

  const loadTrendingMovies = async () =>{
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies)
    } catch (error) {
      console.log(`Error fetching trending movies: ${error}`);
    }
  }
  useEffect(()=>{
    fetchMovies(searchTerm);
  },[debounceSearchTerm])
  useEffect(()=>{
    loadTrendingMovies();
  },[])
  return(
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <header>
          <img src="./hero.png" alt="Hero Image" />
          <h1>
            Find <span className='text-gradient'>Movies</span> You'll Enjoy without the Hassle
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>
        {trendingMovies.length>0 && (
          <section className='trending'>
            <h2>Trending Movies</h2>
            <ul>
              {trendingMovies.map((movie, index)=>(
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className='all-movies'>
          <h2>All Movies</h2>
          {
            isLoading? (
              <Spinner className='align-center' />
            ): errorMessage? (
              <p className='text-red-500'>{errorMessage}</p>
            ):
              <ul>
                {
                  movieList.map((e)=>(
                    <MovieCard movie={e} />
                  ))
                }
              </ul>
          }
        </section>
      </div>
    </main>
  )
}
export default App


// Extensions 
// 1. react snippets
// 2. tailwind css