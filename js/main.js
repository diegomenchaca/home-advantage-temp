import { initBars }           from './viz1_bars.js';
import { initSlope }          from './viz2_slope.js';
import { splitBarsToGlyphs, cancelMorph } from './transition.js';

const SVG = d3.select('#main-svg');

Promise.all([
  d3.json('data/venue_rates.json'),
  d3.json('data/host_elo.json'),
]).then(([venueData]) => {

  const updateBars  = initBars(SVG, venueData);
  const updateSlope = initSlope(SVG, null);

  const g1 = SVG.select('.viz1-group');
  const g2 = SVG.select('.viz2-group');

  const BARS_STEPS  = new Set(['1', '2', '3']);
  const SLOPE_STEPS = new Set(['5.1', '5.2', '5.3', '5.4']);

  function setViz(step) {
    g1.transition().duration(350)
      .attr('opacity', BARS_STEPS.has(step) ? 1 : 0)
      .attr('pointer-events', BARS_STEPS.has(step) ? 'all' : 'none');

    g2.transition().duration(350)
      .attr('opacity', SLOPE_STEPS.has(step) ? 1 : 0)
      .attr('pointer-events', SLOPE_STEPS.has(step) ? 'all' : 'none');
  }

  let prevStep = null;

  function routeStep(step, direction = 'down') {
    const from = prevStep;
    prevStep = step;

    if (step === '4') {
      if (direction === 'up') {
        if (SLOPE_STEPS.has(from)) {
          // Scrolled back from slope section: animated backward morph
          updateBars('3');
          updateSlope('4');  // reset slope currentStep so 5.1 re-animates next visit
          splitBarsToGlyphs(SVG, g1, g2, from);
        } else {
          // Mid-forward-morph interrupted by quick upward scroll: snap back
          cancelMorph(SVG, g1, g2);
          updateBars('3');
        }
      } else {
        // Forward: morph animation takes full control of g1/g2
        splitBarsToGlyphs(SVG, g1, g2, from);
      }
      return;
    }

    // Leaving step 4 — cancel any in-progress morph
    if (from === '4') {
      if (BARS_STEPS.has(step)) {
        // Backward into bar chart: snap g1/g2 back to bar state
        cancelMorph(SVG, g1, g2);
      } else {
        // Forward into slope: only clean up stray pieces, let setViz handle groups
        SVG.selectAll('.morph-piece').interrupt().remove();
      }
    }

    setViz(step);
    if (BARS_STEPS.has(step))  updateBars(step);
    if (SLOPE_STEPS.has(step)) updateSlope(step);
  }

  const scroller = scrollama();
  scroller
    .setup({ step: '.scroll-step', offset: 0.5 })
    .onStepEnter(({ element, direction }) => {
      document.querySelectorAll('.scroll-step')
        .forEach(el => el.classList.remove('is-active'));
      element.classList.add('is-active');
      routeStep(element.dataset.step, direction);
    });

  routeStep('1');
  updateBars('1');

  window.addEventListener('resize', scroller.resize);
});
