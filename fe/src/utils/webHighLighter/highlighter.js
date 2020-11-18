import '@src/design/highlighter/my.css'
import Highlighter from 'web-highlighter'
import LocalStore from './local.store'

const highlighter = new Highlighter({
    wrapTag: 'i',
    exceptSelectors: ['.my-remove-tip', 'pre', 'code'],
    style:{
      className:'highLight'
    }
})
const store = new LocalStore()
const log = console.log.bind(console, '[highlighter]');

// add some listeners to handle interaction, such as hover
highlighter
    .on(Highlighter.event.HOVER, ({id}) => {
        // display different bg color when hover
        highlighter.addClass('highlight-wrap-hover', id);
    })
    .on(Highlighter.event.HOVER_OUT, ({id}) => {
        // remove the hover effect when leaving
        highlighter.removeClass('highlight-wrap-hover', id);
    })
    .on(Highlighter.event.CREATE, ({sources}) => {
        sources = sources.map(hs => ({hs}));
        // save to backend
        store.save(sources);
    })
    .on(Highlighter.event.REMOVE, ({ids}) => {
        log('remove -', ids);
        ids.forEach(id => store.remove(id));
    });

// retrieve data from store, and display highlights on the website
store.getAll().forEach(
    // hs is the same data saved by 'store.save(sources)'
    ({hs}) => highlighter.fromStore(hs.startMeta, hs.endMeta, hs.text, hs.id)
);

export default highlighter