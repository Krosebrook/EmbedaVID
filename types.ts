/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export enum AppState {
  IDLE = 'IDLE',
  ONBOARDING = 'ONBOARDING',
  CHECKING_KEY = 'CHECKING_KEY',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  GENERATING_VIDEO = 'GENERATING_VIDEO',
  PLAYING = 'PLAYING',
  ERROR = 'ERROR'
}

export interface UserContext {
  role: 'Engineer' | 'Product' | 'Ops' | 'Exec' | 'Research' | '';
  task: 'CodeGen' | 'Analysis' | 'Writing' | 'Agentic Workflow' | 'Evaluation' | '';
  env: 'Production' | 'Staging' | 'Experimentation' | '';
  risk: 'Low' | 'Medium' | 'High';
  domain: string;
}

export interface GenerationResult {
  imageUrl?: string;
  videoUrl?: string;
}