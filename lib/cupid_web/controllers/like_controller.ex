defmodule CupidWeb.LikeController do
  use CupidWeb, :controller

  alias Cupid.Likes
  alias Cupid.Likes.Like
  alias Cupid.Matches
  alias CupidWeb.Notification

  action_fallback CupidWeb.FallbackController

  plug CupidWeb.Plugs.RequireAuth when action in [:create, :show, :delete]

  def index(conn, _params) do
    likes = Likes.list_likes()
    render(conn, "index.json", likes: likes)
  end

  def create(conn, %{"like_to_id" => like_to_id}) do
    like_from_id = conn.assigns[:current_user].id
    # check if the reverse realtion exist
    reverse_realtion = Likes.get_like(like_to_id, like_from_id)

    if reverse_realtion do
      # remove the reverse like realtion
      Likes.delete_like(reverse_realtion)
      # add to match
      Matches.create_match(%{user1_id: like_to_id, user2_id: like_from_id})
      Notification.notify_success(like_from_id,
        "new_match", "A New Match",
        "The person you are interested in is also interested in you, let's chat!")
      Notification.notify_success(like_to_id,
        "new_match", "A New Match",
        "A person you are interested in just liked interested in you, let's chat!")
      render(conn, "like_user.json", like: "")
    else
      like_params = %{
        like_from_id: like_from_id,
        like_to_id: like_to_id
      }
      with {:ok, %Like{} = like} <- Likes.create_like(like_params) do
        conn
        |> put_status(:created)
        |> put_resp_header("location", Routes.like_path(conn, :show, like))
        |> render("show.json", like: like)
      end
    end
  end

  def show(conn, %{"id" => id}) do
    like = Likes.get_like!(id)
    render(conn, "show.json", like: like)
  end

  def update(conn, %{"id" => id, "like" => like_params}) do
    like = Likes.get_like!(id)

    with {:ok, %Like{} = like} <- Likes.update_like(like, like_params) do
      render(conn, "show.json", like: like)
    end
  end

  def delete(conn, %{"id" => id}) do
    like = Likes.get_like!(id)

    with {:ok, %Like{}} <- Likes.delete_like(like) do
      send_resp(conn, :no_content, "")
    end
  end
end
