import React, { useState, useCallback, useEffect, useContext } from 'react';
import { NextPage } from 'next';
import { Icon } from 'antd';
import InfiniteScroll from 'react-infinite-scroller';
import { GlobalContext } from '@/context/global';
import { DoubleColumnLayout } from '@/layout/DoubleColumnLayout';
import { ArticleProvider } from '@/providers/article';
import { CategoryProvider } from '@/providers/category';
import { ArticleList } from '@components/ArticleList';
import { ArticleRecommend } from '@/components/ArticleRecommend';
import { Categories } from '@components/Categories';
import { Tags } from '@components/Tags';
import { Footer } from '@components/Footer';
import style from './index.module.scss';

interface IProps {
  articles: IArticle[];
  total: number;
  category: ICategory;
}

const pageSize = 12;

const Home: NextPage<IProps> = ({ articles: defaultArticles = [], total, category }) => {
  const { setting, tags, categories } = useContext(GlobalContext);
  const [page, setPage] = useState(1);
  const [articles, setArticles] = useState<IArticle[]>(defaultArticles);

  useEffect(() => {
    setArticles(defaultArticles);
  }, [defaultArticles]);

  const getArticles = useCallback(
    (page) => {
      ArticleProvider.getArticlesByCategory(category.value, {
        page,
        pageSize,
        status: 'publish',
      }).then((res) => {
        setPage(page);
        setArticles((articles) => [...articles, ...res[0]]);
      });
    },
    [category]
  );

  return (
    <DoubleColumnLayout
      leftNode={
        <>
          <div className={style.tagOrCategoryDetail}>
            <div>
              <Icon type="book" />
            </div>
            <p>
              <span>{category && category.label}</span> 分类文章
            </p>
            <p>
              共搜索到 <span>{total}</span> 篇
            </p>
          </div>
          <InfiniteScroll
            pageStart={1}
            loadMore={getArticles}
            hasMore={page * pageSize < total}
            loader={
              <div className={'loading'} key={0}>
                正在获取文章...
              </div>
            }
          >
            <ArticleList articles={articles} />
          </InfiniteScroll>
        </>
      }
      rightNode={
        <>
          <ArticleRecommend mode="inline" />
          <div className={'sticky'}>
            <Categories categories={categories} />
            <Tags tags={tags} />
            <Footer className={style.footer} setting={setting} />
          </div>
        </>
      }
    />
  );
};

// 服务端预取数据
Home.getInitialProps = async (ctx) => {
  const { category: categoryValue } = ctx.query;
  const [articles, category] = await Promise.all([
    ArticleProvider.getArticlesByCategory(categoryValue, {
      page: 1,
      pageSize,
      status: 'publish',
    }),
    CategoryProvider.getCategoryById(categoryValue),
  ]);
  return {
    articles: articles[0],
    total: articles[1],
    category: category,
    needLayoutFooter: false,
  };
};

export default Home;
