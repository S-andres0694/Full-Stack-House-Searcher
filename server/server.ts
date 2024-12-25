import app from './app';

const port: string | number = process.env.PORT || 3000;

//Standard listening for the server.
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
