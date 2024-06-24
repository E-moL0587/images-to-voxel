namespace ImagesToVoxel.Controllers {
  public class LaplacianSmoothing {
    private int iterations;
    private float lambda;

    public LaplacianSmoothing(int iterations = 2, float lambda = 0.5f) {
      this.iterations = iterations;
      this.lambda = lambda;
    }

    public List<float[]> Smooth(List<float[]> meshData) {
      var smoothData = new List<float[]>(meshData.Select(v => (float[])v.Clone()).ToList());

      for (int i = 0; i < iterations; i++) {
        smoothData = ApplySmoothing(smoothData);
      }

      return smoothData;
    }

    private List<float[]> ApplySmoothing(List<float[]> meshData) {
      var newMeshData = new List<float[]>(meshData.Count);

      for (int i = 0; i < meshData.Count; i++) {
        var vertex = meshData[i];
        var neighbors = GetNeighbors(meshData, vertex);
        var newVertex = new float[3];

        for (int j = 0; j < 3; j++) {
          newVertex[j] = vertex[j] + lambda * (neighbors.Average(n => n[j]) - vertex[j]);
        }

        newMeshData.Add(newVertex);
      }

      return newMeshData;
    }

    private static List<float[]> GetNeighbors(List<float[]> meshData, float[] vertex, float threshold = 1.5f) {
      var neighbors = new List<float[]>();

      foreach (var v in meshData) {
        if (!v.SequenceEqual(vertex) && Distance(v, vertex) < threshold) {
          neighbors.Add(v);
        }
      }

      return neighbors;
    }

    private static float Distance(float[] a, float[] b) {
      return (float)Math.Sqrt((a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]) + (a[2] - b[2]) * (a[2] - b[2]));
    }
  }
}
