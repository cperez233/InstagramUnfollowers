# InstagramUnfollowers

**English** · [Español](README.es.md)

<img src="./assets/results.png" alt="List of accounts that don't follow you back" width="720" />

See which accounts you follow don't follow you back. It runs in your own browser, inside your Instagram session: nothing to install, and it never asks for your password.

A fork of David Arroyo's [InstagramUnfollowers](https://github.com/davidarroyo1234/InstagramUnfollowers). The idea and the groundwork are his. This fork fixes wrong results on big accounts and simplifies the interface.

**Get the code:** https://cperez233.github.io/InstagramUnfollowers/

## How to use it

1. Open the page above and click **Copy code**.
2. Go to [instagram.com](https://www.instagram.com/) on a computer and log in.
3. Open the console (`Ctrl + Shift + J` on Windows and Linux, `⌘ + ⌥ + J` on a Mac), paste the code and press `Enter`.
4. Click **Scan**. Accounts that don't follow you back appear as the scan goes.

From the list you can open profiles, search, hide verified accounts, copy usernames, ignore accounts you don't care about, and unfollow one by one (it asks you to confirm). The last scan is saved in your browser.

A scan takes about a second per account you follow. If Instagram starts limiting requests, the scan stops and shows what it already checked; wait a few hours before trying again. Phones have no console; on Android, the [Eruda](https://github.com/liriliri/eruda-android/releases/) browser adds one.

## What we fixed

**Wrong "doesn't follow you back" results.** The original downloaded your whole followers list in small pieces and compared it with the accounts you follow. On big accounts that is hundreds of requests, and one missed piece was enough to show people who do follow you as if they didn't.

Now it asks Instagram about each account you follow and gets a direct yes or no. A hiccup only affects that one account, and the number of requests depends on how many accounts you follow, not on how many followers you have. If a result can't be trusted, the scan tells you instead of showing a wrong list.

**A simpler interface.** One list that looks like Instagram and follows its light or dark theme. Everything not needed to see who doesn't follow you back is gone (extra filters, bulk unfollow, exports, settings).

**A new copy page.** The steps come with a short demo, a bookmark button you can drag to your bar, and a language switch (English and Spanish).

<img src="./assets/copy-page.png" alt="The page where you copy the code" width="720" />

## Development

- Node 16 or newer, then `npm install`.
- `npm run webpack-build` builds `dist/dist.js`.
- `npm run build` also generates `public/index.html` from `src/page/index.html`. GitHub Actions does this on every push to `master`. Don't edit `public/index.html` by hand: PRs that change it are rejected.
- To try the interface without Instagram, serve the repo root and open `http://localhost:<port>/public/preview.html?preview=results` (or `?preview=live` for a scan in progress). On `localhost` it uses sample data.

## License

MIT. The original project is by David Arroyo and its contributors; see [LICENSE](LICENSE).
