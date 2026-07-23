import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AnnotationPreview } from '../../src/renderer/src/components/directoryannotator/components/AnnotationPreview';
import { NotesEditor } from '../../src/renderer/src/components/directoryannotator/components/NotesEditor';
import { TagEditor } from '../../src/renderer/src/components/directoryannotator/components/TagEditor';

describe('directory annotator components', () => {
  it('renders markdown preview and empty preview states', () => {
    const { rerender } = render(<AnnotationPreview notes="" />);
    expect(screen.getByText('Markdown preview is empty')).toBeDefined();

    rerender(<AnnotationPreview notes="# Project notes" />);
    expect(screen.getByText('Project notes')).toBeDefined();
  });

  it('edits notes text', () => {
    const onChange = vi.fn();
    render(<NotesEditor value="old" onChange={onChange} />);

    fireEvent.change(screen.getByPlaceholderText('Write markdown notes for this file or folder...'), {
      target: { value: 'new notes' },
    });

    expect(onChange).toHaveBeenCalledWith('new notes');
  });

  it('adds, deduplicates, recolors, and removes tags', () => {
    const onChange = vi.fn();
    const { rerender } = render(<TagEditor tags={[]} onChange={onChange} />);

    expect(screen.getByText('No tags yet')).toBeDefined();
    fireEvent.click(screen.getByTitle('#3b82f6'));
    fireEvent.change(screen.getByPlaceholderText('Tag name'), { target: { value: ' Client ' } });
    fireEvent.click(screen.getByTitle('Add tag'));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0][0]).toMatchObject({ label: 'Client', color: '#3b82f6' });

    rerender(<TagEditor tags={[{ id: 'client-blue', label: 'Client', color: '#3b82f6' }]} onChange={onChange} />);
    fireEvent.change(screen.getByPlaceholderText('Tag name'), { target: { value: 'client' } });
    fireEvent.click(screen.getByTitle('Add tag'));
    expect(onChange).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTitle('Remove Client'));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });
});
