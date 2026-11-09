// Karma test setup. The Angular 18 karma builder finds the *.spec.ts files itself
// (require.context is not available in this builder), so this file only sets up the test environment.

import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
