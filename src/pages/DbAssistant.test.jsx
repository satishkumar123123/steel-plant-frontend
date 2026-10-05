import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import DbAssistant from './DbAssistant';
const originalFetch = global.fetch;
beforeEach(() => {process.env.REACT_APP_API_URL = 'http://localhost:5005';global.fetch = jest.fn();});
afterEach(() => {global.fetch = originalFetch;});
function open(){render(<MemoryRouter><DbAssistant/></MemoryRouter>);}
test('empty questions disabled; suggested question can be edited and submitted', async () => {
  global.fetch.mockResolvedValue({ok:true,json:async()=>({answer:'CGL has 12 saved motors.',mode:'ai',checkedAt:'2026-10-05T10:00:00Z',sources:[{collection:'motors',total:12,returned:12,recordIds:['fixture-id']}]})});
  open();expect(screen.getByRole('button',{name:/Ask database/})).toBeDisabled();
  fireEvent.click(screen.getByRole('button',{name:'CGL mein total motors kitne hain?'}));
  fireEvent.click(screen.getByRole('button',{name:/Ask database/}));
  expect(await screen.findByText('CGL has 12 saved motors.')).toBeInTheDocument();
  expect(screen.getByText(/Record IDs: fixture-id/)).toBeInTheDocument();
  const [,options]=global.fetch.mock.calls[0];expect(JSON.parse(options.body).question).toBe('CGL mein total motors kitne hain?');
});
test('failed request keeps draft and allows retry without adding a false answer', async () => {
  global.fetch.mockResolvedValue({ok:false,json:async()=>({message:'Database is not connected.'})});open();
  fireEvent.change(screen.getByLabelText('Your question'),{target:{value:'motors'}});fireEvent.click(screen.getByRole('button',{name:/Ask database/}));
  expect(await screen.findByRole('alert')).toHaveTextContent('Database is not connected.');expect(screen.getByLabelText('Your question')).toHaveValue('motors');
  await waitFor(()=>expect(screen.getByRole('button',{name:/Ask database/})).not.toBeDisabled());
});
test('basic mode is labelled, content renders as plain text and clear resets conversation', async () => {
  global.fetch.mockResolvedValue({ok:true,json:async()=>({answer:'<script>alert(1)</script>',mode:'basic',notice:'AI setup pending.',sources:[]})});open();
  fireEvent.change(screen.getByLabelText('Your question'),{target:{value:'motors'}});fireEvent.click(screen.getByRole('button',{name:/Ask database/}));
  expect(await screen.findByText('Database summary · Basic mode')).toBeInTheDocument();expect(screen.getByText('<script>alert(1)</script>')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Clear chat'}));expect(screen.queryByText('<script>alert(1)</script>')).not.toBeInTheDocument();
});
