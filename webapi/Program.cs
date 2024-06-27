var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApiDocument();

var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
builder.Services.AddCors(options => {
  options.AddPolicy(name: MyAllowSpecificOrigins, policy => { 
    policy.WithOrigins("http://localhost:5173").AllowAnyHeader().AllowAnyMethod(); 
  });
});

var app = builder.Build();

if (app.Environment.IsDevelopment()) { 
  app.UseOpenApi(); 
  app.UseSwaggerUi(); 
}

app.UseHttpsRedirection();
app.UseCors(MyAllowSpecificOrigins);

app.MapPost("/incrementArray", (int[][] array) => {
  for (int i = 0; i < array.Length; i++) {
    for (int j = 0; j < array[i].Length; j++) {
      array[i][j]++;
    }
  }
  return Results.Ok(array);
})
.WithName("PostNumberArray")
.WithOpenApi();

app.Run();
