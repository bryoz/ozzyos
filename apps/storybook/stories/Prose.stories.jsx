import { Button } from '@ozzyos/react';
import { allModes } from '../.storybook/modes.js';

export default { title: 'Foundations/Prose', parameters: { chromatic: { modes: allModes } } };

export const BlogPost = {
  render: () => (
    <article className="oz-container oz-section">
      <div className="oz-prose">
        <h1>Designing for many brands</h1>
        <p>
          Long-form content uses <code>.oz-prose</code>. <a href="#tokens">Links</a> use the brand colour.
        </p>
        <h2 id="tokens">Why tokens</h2>
        <p>One source drives Figma Variables, CSS and JavaScript.</p>
        <ul>
          <li>Core primitives</li>
          <li>Semantic roles</li>
          <li>Brand overrides</li>
        </ul>
        <blockquote>Consistency is a feature.</blockquote>
        <pre>
          <code>{'<html data-brand="example-client" data-theme="dark">'}</code>
        </pre>
        <p className="oz-cluster">
          <a className="oz-button" href="#tokens">Plain HTML button</a>
          <Button variant="secondary">React button</Button>
        </p>
      </div>
    </article>
  ),
};
