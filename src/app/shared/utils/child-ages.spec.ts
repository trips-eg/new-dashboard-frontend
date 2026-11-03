import { childAgesText } from './child-ages';

describe('childAgesText', () => {
  it('reads the ages from the booking list, the stored text or an array', () => {
    expect(childAgesText({ countDetails: { childAges: [1, 7] } })).toBe('1، 7');
    expect(childAgesText({ childAges: '5, 9' })).toBe('5، 9');
    expect(childAgesText({ childAges: [3] })).toBe('3');
  });
  it('is empty when there are no children', () => {
    expect(childAgesText({ countDetails: { childAges: [] } })).toBe('');
    expect(childAgesText({ childAges: '' })).toBe('');
    expect(childAgesText(null)).toBe('');
  });
});
