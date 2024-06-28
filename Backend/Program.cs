var builder = WebApplication.CreateBuilder(args);

string policyName = "myPolicy";

builder.Services.AddControllers();
builder.Services.AddCors(o => { o.AddPolicy(name: policyName, policyBuilder => { policyBuilder.WithOrigins("http://localhost:5000").AllowAnyHeader().AllowAnyMethod(); }); });
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment()) { app.UseSwagger(); app.UseSwaggerUI(); }

app.UseRouting();
app.UseCors(policyName);
app.UseAuthorization();
app.MapControllers();
app.Run();
