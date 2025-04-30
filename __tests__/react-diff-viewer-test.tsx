import { shallow, configure } from 'enzyme';
import Adapter from '@cfaester/enzyme-adapter-react-18';
import React from 'react';
import expect from 'expect';

import DiffViewer from '../dist/cjs/index';

configure({ adapter: new Adapter() })

const oldCode = `
const a = 123
const b = 456
const c = 4556
const d = 4566
const e = () => {
  console.log('c')
}
`;

const newCode = `
const a = 123
const b = 456
const c = 4556
const d = 4566
const aa = 123
const bb = 456
`;

describe('Testing react diff viewer', (): void => {
  it('It should render a table', (): void => {
    const node = shallow(<DiffViewer
      oldValue={oldCode}
      newValue={newCode}
    />);

    expect(node.find('table').length).toEqual(1);
  });

  it('It should render diff lines in diff view', (): void => {
    const node = shallow(<DiffViewer
      oldValue={oldCode}
      newValue={newCode}
    />);

    expect(node.find('table > tbody tr').length).toEqual(7);
  });

  it('It should render diff lines in inline view', (): void => {
    const node = shallow(<DiffViewer
      oldValue={oldCode}
      newValue={newCode}
      splitView={false}
    />);

    expect(node.find('table > tbody tr').length).toEqual(9);
  });
});
