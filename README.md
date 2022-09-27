# json-referencable

Keep references in JSON.

# Usage

```typescript
import * as JSONR from 'json-referencable'

const foo = { id: 'foo' }
const bar = { id: 'bar' }
foo.next = bar
bar.next = foo

const json = JSONR.stringify(foo) // '{"refs":{"_ref_0":{"id":"foo","next":"_ref_1"},"_ref_1":{"id":"bar","next":"_ref_0"}},"root":"_ref_0"}'
const parsedFoo = JSONR.parse(json) // `parsedFoo` is structurally the same as `foo`
parsedFoo === parsedFoo.next.next  // true
```

## License

MIT
