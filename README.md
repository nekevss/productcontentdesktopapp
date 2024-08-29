# productcontentdesktopapp
 
## Archived

This application is no longer maintained.

This was created for my first job at Staples. In general, the application comes with:

- A single page application with two smaller applications built in:
    - A quality assurance application
    - A no-code DSL asset builder application
- A DSL interpreter/engine (technically a tree walking interpreter) for generating content based off the DSL AST.
- A bulk product name batcher/runner (Not sure what it is really called ... uh something that can generate content for 20,000 items)

As I am leaving my job, it's time to sunset the project and step away from it completely. Even though this is a mess of tech debt, the application completes its intended function in a consistent and reliable manner. And that's all I could have really asked of it.

## Brief Introduction
 
This was my pet project at Staples to make content quality assurance easier. This tool is not meant for general usage.

Development Birthdate: 9/2020

## Disclaimer:

No matter how much it was mentioned or requested, I was never able to get enough by in for proper compute for this application to use. As a result, there are parts of this constrained by what was available for use. 

The backend had to be built with no compute, high observability for non-technical people to potentially debug, and a few other weird general environmental considerations.

There's a lot here that is probably bad/tech debt and with any luck some good parts. 

The entire development process was a learning experience. There are sections of this that I would redo if I rebuilt this and/or had access to a server. There are other parts that were so bad that I did try to clean it up. In short, the entire thing is a bit of an enigma.

What's important though is that it completed it's job and saved countless hours of work. Almost too well in some regards.
