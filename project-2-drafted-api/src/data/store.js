/**
 * In-memory "database".
 *
 * The brief for Project 2 is explicit that this milestone comes BEFORE
 * scaling into a real database — so plain arrays in memory are the right
 * scope here, not a premature Mongo/Postgres setup. Everything resets
 * when the server restarts; that's expected for this project.
 */

const projects = [
  { id: 1, name: 'Riverside Loft Renovation', client: 'Eastvale Residential', status: 'on-track', progress: 72, dueDate: '2026-09-14' },
  { id: 2, name: 'Maple & Co. Office Fit-out', client: 'Maple & Co.', status: 'at-risk', progress: 38, dueDate: '2026-10-02' },
  { id: 3, name: 'Birchwood Residence', client: 'Private Client', status: 'ahead', progress: 91, dueDate: '2026-08-30' },
  { id: 4, name: 'Harbor View Pavilion', client: 'Harbor Trust', status: 'on-track', progress: 55, dueDate: '2026-11-20' },
  { id: 5, name: 'Kestrel Studio Extension', client: 'Kestrel Arts Collective', status: 'on-track', progress: 20, dueDate: '2026-12-05' },
];

const tasks = [
  { id: 1, text: 'Confirm site visit time with Harbor Trust', completed: false, projectId: 4 },
  { id: 2, text: 'Upload structural calcs for Birchwood', completed: true, projectId: 3 },
  { id: 3, text: "Chase Maple & Co. invoice #1042", completed: false, projectId: 2 },
];

const team = [
  { id: 1, name: 'Divya Darshini', role: 'Project Manager', availability: 'available' },
  { id: 2, name: 'Elena Marsh', role: 'Lead Architect', availability: 'available' },
  { id: 3, name: 'Jamie Okafor', role: 'Interior Design', availability: 'busy' },
  { id: 4, name: 'Theo Suárez', role: 'Structural Engineer', availability: 'available' },
  { id: 5, name: 'Nadia Petrov', role: 'Draftsperson', availability: 'off' },
];

let nextProjectId = projects.length + 1;
let nextTaskId = tasks.length + 1;

module.exports = {
  projects,
  tasks,
  team,
  getNextProjectId: () => nextProjectId++,
  getNextTaskId: () => nextTaskId++,
};
