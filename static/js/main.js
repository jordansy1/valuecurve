let chartInstance = null;
let chartData = null;
let currentHighlightMode = 'none';
let selectedCompetitors = new Set();
let currentZones = null;

document.addEventListener('DOMContentLoaded', function () {
    fetch('/api/data')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert('Error loading data: ' + data.error);
                return;
            }
            chartData = data;
            displayUserPersona(data);
            initializeCompetitorList(data);
            renderChart(data);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to load data.');
        });
});

function displayUserPersona(data) {
    const personaElement = document.getElementById('user-persona');
    if (data.user_persona) {
        personaElement.textContent = data.user_persona;
    }
}

function displayJobDescriptions(data, zones = null, mode = 'none') {
    const container = document.getElementById('job-descriptions');
    const userJobs = data.user_jobs || data.features || [];
    const threshold = 0.5;

    container.innerHTML = '';

    userJobs.forEach((job, index) => {
        const jobName = typeof job === 'object' ? job.name : job;
        const jobDesc = typeof job === 'object' ? job.description : '';

        // Filter based on highlight mode
        if (zones && mode !== 'none') {
            const zone = zones.find(z => z.index === index);
            if (!zone) return;

            if (mode === 'advantage' && zone.advantage <= threshold) return;
            if (mode === 'disadvantage' && zone.advantage >= -threshold) return;
        }

        const jobBox = document.createElement('div');
        jobBox.className = 'job-box';

        const title = document.createElement('div');
        title.className = 'job-box-title';
        title.textContent = jobName;

        jobBox.appendChild(title);

        if (jobDesc) {
            const desc = document.createElement('div');
            desc.className = 'job-box-desc';
            desc.textContent = jobDesc;
            jobBox.appendChild(desc);
        }

        container.appendChild(jobBox);
    });
}

function initializeCompetitorList(data) {
    const curves = data.curves || [];
    const listContainer = document.getElementById('competitor-list');

    curves.forEach((curve, index) => {
        const div = document.createElement('div');
        div.className = 'competitor-checkbox';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `competitor-${index}`;
        checkbox.value = curve.customer_profile;
        checkbox.checked = true; // All selected by default
        checkbox.onchange = () => toggleCompetitor(curve.customer_profile);

        const label = document.createElement('label');
        label.htmlFor = `competitor-${index}`;
        label.textContent = curve.customer_profile;

        div.appendChild(checkbox);
        div.appendChild(label);
        listContainer.appendChild(div);

        // Add to selected set
        selectedCompetitors.add(curve.customer_profile);
    });
}

function toggleCompetitor(competitorName) {
    if (selectedCompetitors.has(competitorName)) {
        selectedCompetitors.delete(competitorName);
    } else {
        selectedCompetitors.add(competitorName);
    }
    renderChart(chartData);
}

function selectAllCompetitors() {
    const checkboxes = document.querySelectorAll('#competitor-list input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
        selectedCompetitors.add(checkbox.value);
    });
    renderChart(chartData);
}

function clearAllCompetitors() {
    const checkboxes = document.querySelectorAll('#competitor-list input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
        selectedCompetitors.delete(checkbox.value);
    });
    renderChart(chartData);
}

function setHighlightMode(mode) {
    currentHighlightMode = mode;

    // Update button states
    document.querySelectorAll('.highlight-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-${mode}`).classList.add('active');

    // Update job descriptions display
    displayJobDescriptions(chartData, currentZones, mode);

    // Re-render chart with new highlights
    if (chartData) {
        renderChart(chartData);
    }
}

function getJobNames(data) {
    const userJobs = data.user_jobs || data.features || [];
    return userJobs.map(job => typeof job === 'object' ? job.name : job);
}

function calculateHighlightZones(data, selectedCurves) {
    const jobNames = getJobNames(data);

    // Find "Our Solution" curve
    const ourSolution = selectedCurves.find(c =>
        c.customer_profile.toLowerCase().includes('our solution')
    );

    if (!ourSolution) {
        return [];
    }

    const ourValues = ourSolution.relative_customer_value;
    const competitors = selectedCurves.filter(c => c !== ourSolution);
    const zones = [];

    // For each feature, calculate advantage/disadvantage vs. closest competitor
    jobNames.forEach((jobName, index) => {
        const ourValue = ourValues[index];

        if (competitors.length === 0) {
            zones.push({
                index,
                job: jobName,
                advantage: 0,
                ourValue,
                closestCompetitorValue: ourValue,
                closestCompetitorName: 'None'
            });
            return;
        }

        // Find the closest competitor value at this index
        let closestDistance = Infinity;
        let closestValue = null;
        let closestName = '';

        competitors.forEach(competitor => {
            const competitorValue = competitor.relative_customer_value[index];
            const distance = Math.abs(ourValue - competitorValue);

            if (distance < closestDistance) {
                closestDistance = distance;
                closestValue = competitorValue;
                closestName = competitor.customer_profile;
            }
        });

        // Calculate advantage as difference from closest competitor
        const advantage = ourValue - closestValue;

        zones.push({
            index,
            job: jobName,
            advantage,
            ourValue,
            closestCompetitorValue: closestValue,
            closestCompetitorName: closestName
        });
    });

    return zones;
}

function getAnnotations(zones, mode) {
    if (mode === 'none' || !zones.length) {
        return {};
    }

    const annotations = {};

    // Define threshold for "significant" advantage/disadvantage
    const threshold = 0.5;

    zones.forEach((zone, idx) => {
        let shouldHighlight = false;
        let color = '';

        if (mode === 'advantage' && zone.advantage > threshold) {
            shouldHighlight = true;
            color = 'rgba(46, 204, 113, 0.15)'; // Green
        } else if (mode === 'disadvantage' && zone.advantage < -threshold) {
            shouldHighlight = true;
            color = 'rgba(231, 76, 60, 0.15)'; // Red
        }

        if (shouldHighlight) {
            annotations[`box${idx}`] = {
                type: 'box',
                xMin: idx - 0.4,
                xMax: idx + 0.4,
                yMin: -5.5,
                yMax: 5.5,
                backgroundColor: color,
                borderWidth: 0
            };
        }
    });

    return annotations;
}

function renderChart(data) {
    const ctx = document.getElementById('valueCurveChart').getContext('2d');

    // Update title
    document.getElementById('chart-title').textContent = `Value Curves: ${data.industry || 'Unknown Industry'}`;

    const jobNames = getJobNames(data);
    const allCurves = data.curves || [];

    // Filter to only selected competitors
    const selectedCurves = allCurves.filter(curve =>
        selectedCompetitors.has(curve.customer_profile)
    );

    // Calculate highlight zones based on selected curves
    currentZones = calculateHighlightZones(data, selectedCurves);
    const annotations = getAnnotations(currentZones, currentHighlightMode);

    // Update job descriptions with current zones and mode
    displayJobDescriptions(data, currentZones, currentHighlightMode);

    // Define some nice colors
    const colors = [
        { border: 'rgba(54, 162, 235, 1)', background: 'rgba(54, 162, 235, 0.2)' }, // Blue
        { border: 'rgba(255, 99, 132, 1)', background: 'rgba(255, 99, 132, 0.2)' }, // Red
        { border: 'rgba(75, 192, 192, 1)', background: 'rgba(75, 192, 192, 0.2)' }, // Teal
        { border: 'rgba(255, 206, 86, 1)', background: 'rgba(255, 206, 86, 0.2)' }, // Yellow
        { border: 'rgba(153, 102, 255, 1)', background: 'rgba(153, 102, 255, 0.2)' } // Purple
    ];

    const datasets = selectedCurves.map((curve, index) => {
        const color = colors[index % colors.length];
        return {
            label: curve.customer_profile,
            data: curve.relative_customer_value,
            borderColor: color.border,
            backgroundColor: 'transparent',
            borderWidth: 3,
            pointBackgroundColor: 'white',
            pointBorderColor: color.border,
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8,
            tension: 0.3
        };
    });

    // Destroy previous chart instance if it exists
    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: jobNames,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    min: -5.5,
                    max: 5.5,
                    ticks: {
                        stepSize: 1
                    },
                    grid: {
                        color: (context) => context.tick.value === 0 ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)',
                        lineWidth: (context) => context.tick.value === 0 ? 2 : 1
                    },
                    title: {
                        display: true,
                        text: 'Relative Value'
                    }
                },
                x: {
                    grid: {
                        display: true
                    },
                    title: {
                        display: true,
                        text: 'Key User Jobs'
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 0
                    }
                }
            },
            plugins: {
                annotation: {
                    annotations: annotations
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 13
                    },
                    padding: 10,
                    cornerRadius: 8
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}
