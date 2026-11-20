import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';

/**
 * Primary action control. Renders a native `<button>`, or an `<a>` when `href` is set.
 *
 * @slot - Button label
 * @slot start - Leading icon
 * @slot end - Trailing icon
 * @csspart control - The inner button/anchor element
 */
@customElement('oz-button')
export class OzButton extends LitElement {
  static formAssociated = true;

  static styles = css`
    :host { display: inline-block; }
    :host([full-width]) { display: block; }
    .control {
      display: inline-flex; align-items: center; justify-content: center; gap: var(--oz-space-2);
      inline-size: 100%; min-block-size: 2.75rem; padding: var(--oz-space-2) var(--oz-space-5);
      border: 1px solid transparent; border-radius: var(--oz-brand-radius-control);
      font: inherit; font-weight: var(--oz-font-weight-semibold); line-height: 1.2;
      text-decoration: none; cursor: pointer;
      background: var(--oz-color-action-primary); color: var(--oz-color-action-on-primary);
      transition: background-color var(--oz-motion-duration-fast) ease;
    }
    .control:hover { background: var(--oz-color-action-primary-hover); }
    .control:focus-visible { outline: 2px solid var(--oz-color-focus-ring); outline-offset: 2px; }
    :host([variant='secondary']) .control { background: transparent; color: var(--oz-color-text-default); border-color: var(--oz-color-border-strong); }
    :host([variant='secondary']) .control:hover { background: var(--oz-color-bg-muted); }
    :host([variant='ghost']) .control { background: transparent; color: var(--oz-color-text-link); }
    :host([variant='ghost']) .control:hover { background: var(--oz-color-bg-accent); }
    :host([size='sm']) .control { min-block-size: 2.25rem; padding: var(--oz-space-1) var(--oz-space-3); font-size: var(--oz-font-size-sm); }
    :host([size='lg']) .control { min-block-size: 3.25rem; padding: var(--oz-space-3) var(--oz-space-6); font-size: var(--oz-font-size-lg); }
    :host([disabled]) .control { opacity: 0.5; cursor: not-allowed; }
  `;

  /** Visual style. */
  @property({ reflect: true }) variant: 'primary' | 'secondary' | 'ghost' = 'primary';
  /** Control size. */
  @property({ reflect: true }) size: 'sm' | 'md' | 'lg' = 'md';
  /** Native button type when used inside a form. */
  @property() type: 'button' | 'submit' | 'reset' = 'button';
  /** Renders as a link when set. */
  @property() href?: string;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true, attribute: 'full-width' }) fullWidth = false;

  private internals = this.attachInternals();

  private onClick(e: Event) {
    if (this.disabled) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return;
    }
    const form = this.internals.form;
    if (!form || this.href) return;
    if (this.type === 'submit') form.requestSubmit();
    if (this.type === 'reset') form.reset();
  }

  render() {
    const content = html`<slot name="start"></slot><slot></slot><slot name="end"></slot>`;
    if (this.href) {
      return html`<a
        part="control"
        class="control"
        href=${ifDefined(this.disabled ? undefined : this.href)}
        aria-disabled=${this.disabled ? 'true' : nothing}
        @click=${this.onClick}
        >${content}</a
      >`;
    }
    return html`<button part="control" class="control" type="button" ?disabled=${this.disabled} @click=${this.onClick}>
      ${content}
    </button>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'oz-button': OzButton;
  }
}
