'use strict'

window.addEventListener('load', () => {
	
    const getPerformance = function(){
        const perf = performance.getEntriesByType('navigation')[0];
        console.log(perf)
    }

    getPerformance();
})