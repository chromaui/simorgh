import config from '../../../support/config/services';

// For testing important features that differ between services, e.g. Timestamps.
// We recommend using inline conditional logic to limit tests to services which differ.
export const testsThatAlwaysRun = ({ service, pageType }) => {
  describe(`No testsToAlwaysRun to run for ${service} ${pageType}`, () => {});
};

// For testing feastures that may differ across services but share a common logic e.g. translated strings.
export const testsThatFollowSmokeTestConfig = ({ service, pageType }) =>
  describe(`Tests for ${service} ${pageType}`, () => {
    describe('Live Radio body', () => {
      it('should render a H1, which contains/displays a styled headline', () => {
        cy.request(`${config[service].pageTypes.liveRadio.path}.json`).then(
          ({ body }) => {
            const [{ text: headline }] = body.content.blocks;
            cy.get('h1').should('contain', headline);
          },
        );
      });

      it('should render an H2, which contains/displays a styled subheading', () => {
        cy.request(`${config[service].pageTypes.liveRadio.path}.json`).then(
          ({ body }) => {
            if (body.metadata.language === 'en-gb') {
              const { subheadline } = body.content.blocks[1];
              cy.get('h2').should('contain', subheadline);
            }
          },
        );
      });
    });

    describe('LinkedData', () => {
      // will be addressed by this https://github.com/bbc/simorgh/issues/3117
      it.skip('should include mainEntityOfPage in the LinkedData', () => {
        cy.get('script[type="application/ld+json"]')
          .should('contain', 'mainEntityOfPage')
          .and('contain', 'headline');
      });
    });
  });

// For testing low priority things e.g. cosmetic differences, and a safe place to put slow tests.
export const testsThatNeverRunDuringSmokeTesting = ({ service, pageType }) => {
  describe(`No testsToNeverSmokeTest to run for ${service} ${pageType}`, () => {});
};