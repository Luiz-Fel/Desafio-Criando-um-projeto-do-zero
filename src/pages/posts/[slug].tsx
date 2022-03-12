import { GetStaticPaths, GetStaticProps } from 'next';

import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client'
import { useRouter } from 'next/router';
import ptBR from 'date-fns/locale/pt-BR';
import { format } from 'date-fns';
import { FiClock, FiUser, FiCalendar } from "react-icons/fi";



import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import router from 'next/router';
import { RichText } from 'prismic-dom';
import { title } from 'process';

interface Post {
  data: {
    createdAt: string | null;
    title: string;
    timeToRead: number;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

interface ResponseProps{}

export default function Post(props) {
  const data = props.response
 //  const createdAt = format(new Date(Date.parse(response.frist_date)), 
 //     'dd MMM yyyy', {locale: ptBR})
  return(
    <>
      <img src="" alt="" />
      <div className={styles.main}>
        <h1 className={styles.title[0]}>{data.title}</h1>
        <div className={styles.subTitle}>
          <div className={styles.subTitleContainer}>
            <FiCalendar /> {data.createdAt}
          </div>
          <div className={styles.subTitleContainer}>
            <FiUser /> {data.author}
          </div>
          <div className={styles.subTitleContainer}>
            <FiClock /> {`${data.timeToRead} min `}
          </div>
        </div>
        <div dangerouslySetInnerHTML={{__html: String(data.content)}} />
      </div>
    </>
  )
}



export const getStaticPaths = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query
  ([ Prismic.Predicates.at('document.type', 'posts')],
  {
    fetch: ['Post.Title', 'Post.Content'],
  });  // TODO

  return { 
    paths: postsResponse.results.map((current) => { 
      return { params: { slug : current.uid } }
    }),
    fallback: false,
  }
};



export const getStaticProps = async ({params}) => {
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', params.slug, {});
  const timeToRead = (Math.ceil(
    response.data.content[0].body.reduce((pre, cur) => 
      cur.text.split(/[,.\s]/).length + pre, 0)
       / 200))
  
  return { 
    props: {
      response
    }
  }
};