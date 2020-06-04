import React, { Fragment } from 'react';
import path from 'ramda/src/path';
import PageContainer from '#lib/pageStyles/PageContainer';
import FrontPageSection from '#containers/FrontPageSection';
import idxPageDataPropTypes from '#models/propTypes/idxPage';
import ATIAnalytics from '#containers/ATIAnalytics';
import ChartbeatAnalytics from '#containers/ChartbeatAnalytics';

const IdxPage = ({ pageData }) => {
  const groups = path(['content', 'groups'], pageData);

  return (
    <>
      <ATIAnalytics data={pageData} />
      <ChartbeatAnalytics data={pageData} />
      <main role="main">
        <h1 id="content">IDX Page</h1>
        <PageContainer>
          {groups.map((group, index) => (
            <Fragment key={group.title}>
              <FrontPageSection group={group} sectionNumber={index} />
            </Fragment>
          ))}
        </PageContainer>
      </main>
    </>
  );
};

IdxPage.propTypes = {
  pageData: idxPageDataPropTypes.isRequired,
};

export default IdxPage;
