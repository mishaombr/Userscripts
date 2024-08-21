// ==UserScript==
// @name         SmallHackSpam
// @version      0.1
// @description  Automatically select the best hack job (closest to threshold) and submit when the cooldown is over
// @match        https://hackforums.net/gamecp.php?action=smallhacks*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const DESIRED_SUCCESS_RATE = 40;

    function isSubmitButtonReady() {
        const submitButton = document.querySelector('button[name="submit"]');
        const isReady = submitButton && submitButton.textContent.trim() === 'Attempt Hack';
        console.log(`Submit button ready: ${isReady}`);
        return isReady;
    }

    function selectBestJob() {
        const jobRows = document.querySelectorAll('.gtr-dark');
        console.log(`Found ${jobRows.length} job rows.`);

        const bestJob = findBestJob(jobRows);
        if (bestJob) {
            selectJob(bestJob);
        } else {
            console.error('No suitable job found.');
        }
    }

    function findBestJob(jobRows) {
        let bestJob = null;
        let smallestDifference = Infinity;

        jobRows.forEach(row => {
            const successRate = extractSuccessRate(row);
            if (successRate >= DESIRED_SUCCESS_RATE) {
                const difference = successRate - DESIRED_SUCCESS_RATE;
                if (difference < smallestDifference) {
                    smallestDifference = difference;
                    bestJob = row;
                }
            }
        });

        return bestJob;
    }

    function extractSuccessRate(row) {
        const successRateText = row.querySelector('.gtd.tcenter')?.textContent.trim().replace('%', '');
        if (!successRateText) {
            console.error('Success rate element not found in job row.');
            return 0;
        }
        return parseInt(successRateText, 10);
    }

    function selectJob(job) {
        const radioButton = job.querySelector('input[type="radio"]');
        if (radioButton) {
            radioButton.checked = true;
            console.log(`Selected job with success rate ${extractSuccessRate(job)}%`);

            const interval = setInterval(() => {
                if (isSubmitButtonReady()) {
                    document.querySelector('button[name="submit"]').click();
                    console.log('Submitted job.');
                    clearInterval(interval);
                }
            }, 1000);
        } else {
            console.error('Radio button not found for the best job.');
        }
    }

    window.addEventListener('load', () => {
        setTimeout(selectBestJob, 2000);
    });
})();
