import { GetStaticProps } from 'next';
import ptBR from 'date-fns/locale/pt-BR';
import { format } from 'date-fns';
import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client'
import { FiCalendar, FiUser } from "react-icons/fi";
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Link from 'next/link';
import { useState } from 'react';


interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home(props : HomeProps) {
  const [posts, setPosts] = useState(props.postsPagination.results)
  const [nextPosts, setNextPosts] = useState()



  async function addPosts() {
      await fetch(props.postsPagination.next_page, {method: 'GET'}).then(
        (response) => response.json())
        .then(
          (response) => {

            setPosts([...posts, ...response.results])
            setNextPosts(response.next_page)
          }
          )
  }
  
  
  console.log(props)
  return(
    <div className={styles.main}>

      {props.postsPagination.results.map((post) => {
        const time = new Date(post.first_publication_date)
        return(
          <div key={post.uid} className={styles.post}>
            <Link href={`/post/${post.uid}`}>
              <a className={styles.title}>
                <div>

                <h2>{post.data.title}</h2>
                <p className={styles.subTitle}>{post.data.subtitle}</p>
                  <div className={styles.postSubContent}>
                  <FiCalendar />
                  <p>
                    {
                      
                      format(
                        time,
                        "dd MMM yyyy",
                        {
                          locale: ptBR,
                        }
                        )
                        
                      }
                    </p>
                  </div>
                  <div className={styles.postSubContent}>
                  <FiUser />
                    <p>
                    {
                      post.data.author
                    }
                    </p>
                  </div>
                </div>
              </a>
            </Link>
          </div>
        )
      })}
      {
        (nextPosts !== null)
        &&
        <button className={styles.button} onClick={() => addPosts()}>
        Carregar mais posts
       </button>
      }
    </div>
  )
}

export const getStaticProps = async () => {
   const prismic = getPrismicClient();
   const postsResponse = await prismic.query
   ([ Prismic.Predicates.at('document.type', 'posts')],
   {
     fetch: ['Post.Title', 'Post.Content'],
     pageSize: 5
   });

  // TODO
  return {
    props: {
      postsPagination:{
        results: postsResponse.results,
        next_page: postsResponse.next_page
      } 
        
    },
    revalidate: 60 * 30,
  }
};
