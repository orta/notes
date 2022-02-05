# Auth Provider Notes

At Artsy we wrote our own authentication system, I'd say this is pretty easy with Rails via the [devise gem](https://github.com/heartcombo/devise) and I don't think we ever really had much of a debate about moving off to something else. There was always going to be someone to ensure that everything worked. For [Capture](https://cloudcapture.it) we offloaded auth entirely to Zoom, meaning we implemented no authentication system ourselves and used the zoom user ID as the key identifier. This meant we never needed to think about the long term ramifications of auth.

Now for (new thing) I've been back and forth on what to do with authentication. RedwoodJS the app framework I'm using has [quite strong opinions](https://redwoodjs.com/docs/authentication#self-hosted-auth-installation-and-setup) that authentication is something you should be using a separate service for. 

RedwoodJS doesn't quite throw you out and demand you do this, they have a way to [set up a self hosted authentication system](https://github.com/redwoodjs/redwood/pull/2701), but it's built to be simple and extending it to cover all of the possible production cases is largely not recommended. I've been rolling with this for a while because I'm still wiping my db with regularity and simple auth is simple.

I'm kinda on my second run of thinking about authentication as a service, the first time I [asked the internet](https://twitter.com/orta/status/1447984697812963334):

> I’ve been debating for a few weeks now about the trade-offs of using auth0/etc instead of self building identity management. Anyone got strong opinions either way?

But I only really got responses from folks who work for those companies and people who weren't sold on the pricing model. I think has [two good](https://community.redwoodjs.com/t/pure-social-authentication/2644/6) [arguments](https://community.redwoodjs.com/t/local-jwt-auth-implementation/1359/5) I've heard came from [@dthyresson](https://twitter.com/dthyresson):

> I don’t meant to be the bearer (haha pun intended!) of bad news, but web apps cost money. Infrastructure costs money.
>
> And I don’t work for Auth0 or anyone else, but I have been in the position to do a cost benefit and risk analysis of choosing a service or rolling one’s own and going with a service always wins. (And I know in certain countries some of these services are not an option – I get that. There is always a contrary case and that happens.)
>
>
> I’ve freelanced and hired developers and in the best case scenario that – for the year – is 2 hours of work or maybe 5 if you can pay someone $~50/hr. But even if you pay them $15/hr (which believe it or not is $3 more than most minimum wage jobs in the US). That’s 4 hours work for 5 days (or 1 week). And you might say, with this auth client I can get it up and running in an hour – and you’d be right. But - you don’t have: password change, email verification, rules pipeline, RBAC support a login/logout or any UI, etc.

> So, for the cost of a handful or two hours of work – you have an Auth services than can service 1,000 active users per month. For. A. Year.
>
> Yes, the cost goes up as the user base goes up – but … guess what … everything about web apps gets more expensive one you have to support more users.

Plus:

> If you are not careful you’ll have to build soooo much. Mail. Password strength. Auditing. Admin api. Callback whitelisting. App and user metadata. Multiple identity provider support. Account blocking. Login attempt anomaly detection. IP address spoof detection. Token refreshing.
>
> Then you’ll want passwordless and magic link. And then SMS one time password authentication. And then support multiple phone providers.
>
> Oh and then 2FA or even MFA.
>
> And then you’ll have to do GDPR protection on all your user profile data.


I think it's a pretty compelling argument, [Zach](https://twitter.com/helvetica) has made the same case. It's definitely worth exploring authentication as a service.

My biggest tension comes from the problem that we're likely to have a _free user tier_ which could be drastically bigger could throw off the numbers completely. As an example, in [Flappy Royale](https://flappyroyale.io) (the last game we collaborated on) we had about 100k free users over the course of 2-3 weeks, and settled at ~250k over the next 2-3 months. Things dropped after a while but it was quite consistent for a few months before we started to slowly make the call that we couldn't get ads for the free accounts to scale.

This means _to me_ it's not unreasonable to _prepare_ for those sorts of scales with (new thing) and but that means suddenly _we're in the "Contact Us" section of Auth0's pricing_ instantly, because the pricing somewhat assumes that all users are equally valuable. Tricky.

( Which I think is reasonable to )

Now that I'm sketching out how a native app should talk to the RedwoodJS app, it felt like a second time to re-look at the ecosystem and try to figure out what I want.

### What am I looking for?

I know today I want: 

- Email or Phone + Password user auth (though I'm not offended by magic links) - we will probably allow some Oauth, but maybe not all
- User model / Accounts will live in my DB in some form, so anything on the auth providers side is probably something I will need to duplicate
- There could be a lot of users, who have good incentives to come back more regularly than once a month
- I think internal organizational Oauth is something we will need to consider within a reasonable timeframe
- Logins should persist for a long time, ideally be self refreshing somehow (I enjoy the JWT + refresh token technique [personally](https://artsy.github.io/blog/2018/06/18/On-Obsessive-Statelessness/))

### How should it work as a user?

Effectively I want to give away the Login page, and the first page of the Signup page. In the future it might make sense to think about MFA

### Things which will get an auth service cut for

- No pricing calculator
- A focus on "web3", it's a service which is literally blocking people signing up/logging in. If they can't be trusted to not join the big grift, they can't be responsible for my users.
- Per user pricing, I'd be looking at too many free user accounts which would maybe make that unaffordable at the start 
- No custom branding etc (which everyone does)
- Required hosting with the service

### Services

- Auth0. Considered the "default" identification service to use, recently bought by Okta. They competed, and it's likely that the consolidation will mean price raising. Either way, I think it falls into the bucket of per-user pricing which would quickly mean we're paying enterprise prices. That said, they have documentation/tutorials/tools everywhere.

- Amazon IAM. I'm trying to avoid giving Amazon money. 

- Azure Active Directory. Seems to mainly offer a way to re-use your Microsoft account. So no go.

- Clerk.dev. Strong focus on Next, and providing UI components which is a nice touch. Not sure I'd use them, but it lowers the barriers for sure. Good design. Mentions web3 stuff a bit, but not too offensive. Seems to largely work with all oauth providers I'm interested in. Getting webhooks to ensure the DB stays in sync requires another service though. Pricing probably can't work  for us though, as it's per active user.

- Firebase. I'm trying to avoid giving Google money. We used it with Flappy Royale and it worked well though.

- FusionAuth. Probably the most compelling, I've got it running locally to test. The design feels quite cheap, but the auth pages can probably be extensively designed. I'd have to build the RedwoodJS integration but that's not offensive. 

- Keycloak. OSS version of Auth0, tempting, though hosting it myself feels like I might have the same security issues I'd get from writing some of this myself. Had a recent CVE which would have required remembering to updating the server etc. Third-party [paid hosting](https://www.cloud-iam.com/#pricing) seems to be quite expensive per user. 

- SuperTokens. OSS also, feels more consumer focused than Keycloak. I think I should give it a test run, but it does imply that we'd be straight in the 'contact us' bucket if using their hosting.

- Supabase. Quite tempting to be honest, there's no upper bounds on users - people who have used Supabase seem to love it. We probably won't use too many other features but we could get it for auth and then maybe find more uses further down the line.

- Playfab. A Microsoft games-oriented firebase competitor. We used it with Flappy Royale, doesn't really do auth as a service separately.

- Magic.link. Turned off by web3 / blockchain / NFT. Didn't go any further than homepage. (That said their pricing per _login_ is an interesting angle.)

- Netlify Identity. Only works if you host on netlify, and I'm not doing that today.

- nhost.io. Feels a little unfinished, with buttons not working and CSS bugs in the home/blog/docs. Doesn't seem to have authentication as a separate services, but seems like a reasonable firebase competitor.


### Alternatives

- Build out a separate app JS just for auth? Why bother though, when we could just host FusionAuth?

- Find a way to have free users _not_ use authentication? We have a good case to want people to have some session state without users, maybe becoming a paid user is the only way to do any logging in at all? This feels a bit tricky to really pull off (and quite limiting in the features we could have) so is unlikely to be an acceptable constraint on the long run.


### Summary

I dunno. That's why it's notes. I think I might try prototype something in Supabase, and then give FusionAth a run before I make any decisions.