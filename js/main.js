import { initBars }     from './viz1_bars.js';
import { initSlope }    from './viz2_slope.js';
import { initExplorer } from './viz3_explorer.js';

const SVG = d3.select('#main-svg');

Promise.all([
  d3.json('data/venue_rates.json'),
  d3.json('data/host_elo.json'),
]).then(([venueData, hostData]) => {

  const updateBars     = initBars(SVG, venueData);
  const updateSlope    = initSlope(SVG, hostData);
  const updateExplorer = initExplorer(SVG, hostData);

  // Each viz group starts hidden; main.js controls cross-viz transitions.
  const g1 = SVG.select('.viz1-group');
  const g2 = SVG.select('.viz2-group');
  const g3 = SVG.select('.viz3-group');

  function setViz(step) {
    const bars    = ['1','2','3'].includes(step);
    const barsLow = step === '4';
    const slope   = step === '5';
    const axesOnly= step === '4';  // also show slope axes at low opacity
    const scatter = step === '6';

    g1.transition().duration(350)
      .attr('opacity', bars ? 1 : barsLow ? 0.2 : 0)
      .attr('pointer-events', bars ? 'all' : 'none');

    g2.transition().duration(350)
      .attr('opacity', slope ? 1 : axesOnly ? 0.35 : 0)
      .attr('pointer-events', slope ? 'all' : 'none');

    g3.transition().duration(350)
      .attr('opacity', scatter ? 1 : 0)
      .attr('pointer-events', scatter ? 'all' : 'none');
  }

  function routeStep(step) {
    setViz(step);
    if (['1','2','3','4'].includes(step)) updateBars(step);
    if (step === '4' || step === '5')     updateSlope(step);
    if (step === '6')                     updateExplorer();
  }

  const scroller = scrollama();
  scroller
    .setup({ step: '.scroll-step', offset: 0.5 })
    .onStepEnter(({ element }) => {
      document.querySelectorAll('.scroll-step')
        .forEach(el => el.classList.remove('is-active'));
      element.classList.add('is-active');
      routeStep(element.dataset.step);
    });

  // Fire step 1 on load so bars are immediately visible.
  routeStep('1');
  updateBars('1');

  window.addEventListener('resize', scroller.resize);
});
