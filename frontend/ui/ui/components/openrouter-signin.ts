/**
 * Sign In with OpenRouter button — lit-html template fragment.
 */

import { html, nothing, type TemplateResult } from 'lit';
import { initiateOAuth, clearApiKey } from '../openrouter-auth';

export type SigninVariant = 'default' | 'minimal' | 'branded' | 'icon' | 'cta';
export type SigninSize = 'sm' | 'default' | 'lg' | 'xl';

export interface SigninProps {
    variant?: SigninVariant;
    size?: SigninSize;
    label?: string;
    loading?: boolean;
    signedIn?: boolean;
    onSignOut?: () => void;
}

const VARIANT_CLASSES: Record<SigninVariant, string> = {
    default:
        'rounded-lg border border-neutral-300 bg-white text-neutral-900 shadow-sm hover:bg-neutral-50',
    minimal: 'text-neutral-700 underline-offset-4 hover:underline',
    branded: 'rounded-lg bg-neutral-900 text-white shadow hover:bg-neutral-800',
    icon: 'rounded-lg border border-neutral-300 bg-white text-neutral-900 shadow-sm hover:bg-neutral-50 aspect-square',
    cta: 'rounded-xl bg-neutral-900 text-white shadow-lg hover:bg-neutral-800 hover:scale-[1.02] active:scale-[0.98]',
};

const SIZE_CLASSES: Record<SigninSize, string> = {
    sm: 'h-8 px-3 text-xs',
    default: 'h-10 px-5 text-sm',
    lg: 'h-12 px-8 text-base',
    xl: 'h-14 px-10 text-lg',
};

const BASE =
    'inline-flex items-center justify-center gap-2 font-medium transition-all cursor-pointer disabled:opacity-50';

const LOGO = html`
    <svg viewBox="0 0 512 512" fill="currentColor" stroke="currentColor" width="20" height="20" aria-hidden="true">
        <path
            d="M3 248.945C18 248.945 76 236 106 219C136 202 136 202 198 158C276.497 102.293 332 120.945 423 120.945"
            stroke-width="90"
        />
        <path d="M511 121.5L357.25 210.268L357.25 32.7324L511 121.5Z" />
        <path
            d="M0 249C15 249 73 261.945 103 278.945C133 295.945 133 295.945 195 339.945C273.497 395.652 329 377 420 377"
            stroke-width="90"
        />
        <path d="M508 376.445L354.25 287.678L354.25 465.213L508 376.445Z" />
    </svg>
`;

export function renderSigninWithOpenRouter(props: SigninProps = {}): TemplateResult {
    const variant = props.variant ?? 'default';
    const size = props.size ?? 'default';
    const cls = `${BASE} ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]}`;
    const label = props.label ?? 'Sign in with OpenRouter';

    if (props.signedIn) {
        return html`
            <button class=${cls} @click=${() => (props.onSignOut?.() ?? clearApiKey())}>
                ${LOGO}
                <span>Sign out</span>
            </button>
        `;
    }

    return html`
        <button class=${cls} ?disabled=${props.loading} @click=${() => void initiateOAuth()}>
            ${LOGO}
            ${variant === 'icon' ? nothing : html`<span>${props.loading ? 'Signing in…' : label}</span>`}
        </button>
    `;
}
