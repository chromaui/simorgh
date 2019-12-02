/* eslint-disable react/prop-types */
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { StaticRouter } from 'react-router-dom';
import { matchSnapshotAsync } from '@bbc/psammead-test-helpers';
import assocPath from 'ramda/src/assocPath';
import path from 'ramda/src/path';
import { ServiceContextProvider } from '#contexts/ServiceContext';
import { RequestContextProvider } from '#contexts/RequestContext';
import { ToggleContext } from '#contexts/ToggleContext';
import CpsAssetPageMain from '.';
import preprocessor from '#lib/utilities/preprocessor';
import igboPageData from '#data/igbo/cpsAssets/afirika-23252735';
import pidginPageData from '#data/pidgin/cpsAssets/23248703';
import uzbekPageData from '#data/uzbek/cpsAssets/sport-23248721';
import { cpsAssetPreprocessorRules } from '#app/routes/getInitialData/utils/preprocessorRulesConfig';

const toggleState = {
  local: {
    mediaPlayer: {
      enabled: true,
    },
  },
  test: {
    mediaPlayer: {
      enabled: true,
    },
  },
  live: {
    mediaPlayer: {
      enabled: false,
    },
  },
};

const createAssetPage = ({ pageData }, service) => (
  <StaticRouter>
    <ToggleContext.Provider value={{ toggleState, toggleDispatch: jest.fn() }}>
      <ServiceContextProvider service={service}>
        <RequestContextProvider
          bbcOrigin="https://www.test.bbc.co.uk"
          isAmp={false}
          pageType={pageData.metadata.type}
          pathname={pageData.metadata.locators.assetUri}
          service={service}
          statusCode={200}
        >
          <CpsAssetPageMain service={service} pageData={pageData} />
        </RequestContextProvider>
      </ServiceContextProvider>
    </ToggleContext.Provider>
  </StaticRouter>
);

const escapedText = text => {
  const textReplacements = {
    '&quot;': '"',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
  };

  const replacementsRegex = new RegExp(
    Object.keys(textReplacements).join('|'),
    'gi',
  );

  return text.replace(replacementsRegex, match => textReplacements[match]);
};

describe('CpsAssetPageMain', () => {
  it('should match snapshot for STY', async () => {
    const pageData = await preprocessor(
      igboPageData,
      cpsAssetPreprocessorRules,
    );

    const page = createAssetPage({ pageData }, 'igbo');
    await matchSnapshotAsync(page);
  });

  describe('should render MAP', () => {
    let pageData;
    let asFragment;
    let getByText;

    beforeEach(async () => {
      pageData = await preprocessor(pidginPageData, cpsAssetPreprocessorRules);

      ({ asFragment, getByText } = render(
        createAssetPage({ pageData }, 'pidgin'),
      ));
    });

    it('with paragraph', () => {
      const paragraphText = path(
        ['content', 'blocks', 3, 'text'],
        pidginPageData,
      );

      expect(getByText(escapedText(paragraphText))).toBeInTheDocument();
      expect(asFragment()).toMatchSnapshot();
    });

    it('with image', () => {
      const imageCaption = path(
        ['content', 'blocks', 25, 'caption'],
        pidginPageData,
      );

      // Images not rendered properly due to lazyload, therefore can only check caption text
      expect(getByText(escapedText(imageCaption))).toBeInTheDocument();
      expect(asFragment()).toMatchSnapshot();
    });

    describe('AV player', () => {
      let liveStreamSource;

      const getLiveStreamSource = liveStreamBlock => {
        return path(
          [
            'model',
            'blocks',
            '0',
            'model',
            'blocks',
            0,
            'model',
            'versions',
            0,
            'versionId',
          ],
          liveStreamBlock,
        );
      };

      it('with version (live audio stream)', async () => {
        pageData = await preprocessor(uzbekPageData, cpsAssetPreprocessorRules);
        const liveStreamBlock = path(
          ['content', 'model', 'blocks', 1],
          pageData,
        );
        liveStreamSource = getLiveStreamSource(liveStreamBlock);
        expect(liveStreamBlock.type).toBe('version');

        ({ asFragment } = render(createAssetPage({ pageData }, 'uzbek')));

        expect(
          document.querySelector(`iframe[src*=${liveStreamSource}]`),
        ).not.toBeNull();
        expect(asFragment()).toMatchSnapshot();
      });

      it('with video', () => {
        const liveStreamBlock = path(
          ['content', 'model', 'blocks', 1],
          pageData,
        );
        liveStreamSource = getLiveStreamSource(liveStreamBlock);
        expect(liveStreamBlock.type).toBe('video');

        expect(
          document.querySelector(`iframe[src*=${liveStreamSource}]`),
        ).not.toBeNull();
        expect(asFragment()).toMatchSnapshot();
      });
    });

    describe('heading', () => {
      let headingText;

      beforeAll(() => {
        headingText = path(['content', 'blocks', 2, 'text'], pidginPageData);
        expect(asFragment()).toMatchSnapshot();
      });

      it('as faux headline', () => {
        const fauxHeadlineBlock = path(
          ['content', 'model', 'blocks', 2],
          pageData,
        );

        expect(fauxHeadlineBlock.type).toBe('fauxHeadline');
        expect(getByText(escapedText(headingText))).toBeInTheDocument();
      });

      it('as visually hidden headline', () => {
        const hiddenHeadline = path(
          ['content', 'model', 'blocks', 0],
          pageData,
        );

        expect(hiddenHeadline.type).toBe('visuallyHiddenHeadline');
        expect(getByText(escapedText(headingText))).toBeInTheDocument();
      });
    });

    it('with sub heading', () => {
      const subHeadingText = path(
        ['content', 'blocks', 3, 'text'],
        pidginPageData,
      );

      expect(getByText(escapedText(subHeadingText))).toBeInTheDocument();
      expect(asFragment()).toMatchSnapshot();
    });

    it('with crosshead', () => {
      const crossHeadText = path(
        ['content', 'blocks', 4, 'text'],
        pidginPageData,
      );

      expect(getByText(escapedText(crossHeadText))).toBeInTheDocument();
      expect(asFragment()).toMatchSnapshot();
    });

    it('with timestamp', () => {
      expect(document.querySelector('div[class^=PopOut]')).not.toBeNull();
    });
  });

  it('should not show the pop-out timestamp when allowDateStamp is false', async () => {
    const pageDataWithHiddenTimestamp = assocPath(
      ['metadata', 'options', 'allowDateStamp'],
      false,
      await preprocessor(pidginPageData, cpsAssetPreprocessorRules),
    );

    const { asFragment } = render(
      createAssetPage({ pageData: pageDataWithHiddenTimestamp }, 'pidgin'),
    );

    expect(document.querySelector('div[class^=PopOut]')).toBeNull();
    expect(asFragment()).toMatchSnapshot();
  });
});
